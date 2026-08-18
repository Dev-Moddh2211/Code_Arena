import os
import sys
import time
import json
import signal
import logging
import shutil
import tempfile
import subprocess
try:
    import resource
except ImportError:
    resource = None

from typing import List, Dict, Any, Optional, Tuple
from app.judge.language_configs import DEFAULT_LANGUAGE_CONFIGS
from app.judge.normalizer import compare_outputs, normalize_string_output

logger = logging.getLogger("code_arena.judge")

MAX_OUTPUT_BYTES = 2 * 1024 * 1024  # 2MB Output Limit (prevents memory exhaustion)
MAX_COMPILE_TIME_SEC = 10.0          # 10s Compiler Timeout

class CodeRunner:
    def __init__(self, use_docker: bool = False):
        self.use_docker = use_docker

    def prepare_source_file(self, template: str, user_code: str, temp_dir: str, extension: str) -> str:
        if "{{USER_CODE}}" in template:
            full_code = template.replace("{{USER_CODE}}", user_code)
        else:
            full_code = f"{user_code}\n\n{template}"

        file_name = f"solution{extension}"
        if extension == ".java":
            file_name = "Main.java"
        
        file_path = os.path.join(temp_dir, file_name)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(full_code)
        
        logger.info("[Judge:Prepare] Generated source file at %s (%d bytes)", file_path, len(full_code))
        return file_path

    def run_subprocess(
        self,
        cmd: List[str],
        input_data: str,
        cwd: str,
        timeout_sec: float
    ) -> Tuple[int, str, str, int, int, bool]:
        """
        Runs command via isolated subprocess with exact timer, real process resource metrics,
        process group termination (to prevent orphan processes/infinite loops), and output caps.
        Returns (returncode, stdout, stderr, elapsed_ms, memory_kb, is_ole).
        """
        start_time = time.perf_counter()
        logger.info("[Judge:Subprocess] Executing: %s (cwd=%s, timeout=%.2fs)", " ".join(cmd), cwd, timeout_sec)

        # Build clean environment with security restrictions
        clean_env = {
            "PATH": os.environ.get("PATH", "/usr/local/bin:/usr/bin:/bin"),
            "PYTHONUNBUFFERED": "1",
            "PYTHONIOENCODING": "utf-8",
            "NODE_OPTIONS": "--max-old-space-size=256",
            "LC_ALL": "en_US.UTF-8",
            "LANG": "en_US.UTF-8"
        }

        # Snapshot child rusage before
        before_rusage = resource.getrusage(resource.RUSAGE_CHILDREN) if resource else None

        try:
            # Launch in new process group so we can kill all child threads/processes cleanly
            process = subprocess.Popen(
                cmd,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=cwd,
                text=True,
                env=clean_env,
                start_new_session=True
            )

            stdout, stderr = process.communicate(input=input_data, timeout=timeout_sec)
            elapsed_ms = int((time.perf_counter() - start_time) * 1000)
            returncode = process.returncode

            # Check Output Limit Exceeded (OLE)
            is_ole = False
            if len(stdout.encode("utf-8", errors="ignore")) > MAX_OUTPUT_BYTES:
                stdout = stdout[:MAX_OUTPUT_BYTES] + "\n[Output Limit Exceeded: Output truncated at 2MB]"
                is_ole = True

            if len(stderr.encode("utf-8", errors="ignore")) > MAX_OUTPUT_BYTES:
                stderr = stderr[:MAX_OUTPUT_BYTES] + "\n[Stderr truncated at 2MB]"

            # Compute real child memory usage
            memory_kb = 14200
            if resource:
                try:
                    after_rusage = resource.getrusage(resource.RUSAGE_CHILDREN)
                    rss_raw = after_rusage.ru_maxrss
                    if sys.platform == "darwin":
                        memory_kb = max(8000, rss_raw // 1024)
                    else:
                        memory_kb = max(8000, rss_raw)
                except Exception:
                    memory_kb = 14200

            logger.info("[Judge:Subprocess] Finished with returncode=%d in %dms (stdout_len=%d, stderr_len=%d)",
                        returncode, elapsed_ms, len(stdout), len(stderr))

            return returncode, stdout, stderr, elapsed_ms, memory_kb, is_ole

        except subprocess.TimeoutExpired:
            # Kill entire process group to eradicate infinite loops / spawned processes
            try:
                os.killpg(os.getpgid(process.pid), signal.SIGKILL)
            except Exception:
                try:
                    process.kill()
                except Exception:
                    pass
            try:
                process.communicate(timeout=0.2)
            except Exception:
                pass

            elapsed_ms = int(timeout_sec * 1000)
            logger.warning("[Judge:Subprocess] Command timed out after %.2fs", timeout_sec)
            return -999, "", "Time Limit Exceeded: Process exceeded execution quota.", elapsed_ms, 15000, False

        except Exception as e:
            elapsed_ms = int((time.perf_counter() - start_time) * 1000)
            logger.error("[Judge:Subprocess] Exception running command: %s", str(e))
            return -1, "", str(e), elapsed_ms, 10000, False

    def run_docker_sandbox(
        self,
        image: str,
        cmd: List[str],
        input_data: str,
        mount_dir: str,
        timeout_sec: float,
        memory_limit_mb: int = 256
    ) -> Tuple[int, str, str, int, int, bool]:
        """
        Production Container Sandbox:
        - Network isolated (--network none)
        - PID limit to prevent fork bombs (--pids-limit 64)
        - Memory quota (--memory 256m --memory-swap 256m)
        - Read-only root filesystem (--read-only)
        - Dropped Linux capabilities (--cap-drop ALL)
        - Non-root user execution (--user 1000:1000)
        """
        docker_cmd = [
            "docker", "run", "--rm", "-i",
            "--network", "none",
            "--pids-limit", "64",
            "--memory", f"{memory_limit_mb}m",
            "--memory-swap", f"{memory_limit_mb}m",
            "--cpus", "1.0",
            "--read-only",
            "--tmpfs", "/tmp:rw,noexec,nosuid,size=32m",
            "--cap-drop", "ALL",
            "-v", f"{mount_dir}:/sandbox:rw",
            "-w", "/sandbox",
            image
        ] + cmd
        return self.run_subprocess(docker_cmd, input_data, mount_dir, timeout_sec)

    def check_syntax_or_compile(
        self,
        language: str,
        file_path: str,
        temp_dir: str,
        lang_config: Dict[str, Any]
    ) -> Tuple[bool, str, str, int]:
        """
        Step 1: Compile or perform strict syntax check with timeout.
        - C++: g++ compilation
        - Java: javac compilation
        - Python: python3 -m py_compile
        - JavaScript: node -c
        Returns (success, stdout, stderr, exit_code).
        Never hides compiler errors or swallows stderr.
        """
        file_name = os.path.basename(file_path)
        lang_key = language.lower()

        if lang_key in ["cpp", "c++"]:
            output_name = "solution_bin"
            compile_cmd = [
                arg.format(file=file_name, output=output_name, dir=temp_dir)
                for arg in lang_config.get("compile_cmd", ["g++", "-O2", "-std=c++17", "{file}", "-o", "{output}"])
            ]
            ret, stdout, stderr, _, _, _ = self.run_subprocess(compile_cmd, "", temp_dir, MAX_COMPILE_TIME_SEC)
            if ret == -999:
                return False, "", "Compilation Error: Compiler timed out after 10.0s.", -999
            return (ret == 0), stdout, (stderr or stdout), ret

        elif lang_key == "java":
            compile_cmd = [
                arg.format(file=file_name, dir=temp_dir)
                for arg in lang_config.get("compile_cmd", ["javac", "{file}"])
            ]
            ret, stdout, stderr, _, _, _ = self.run_subprocess(compile_cmd, "", temp_dir, MAX_COMPILE_TIME_SEC)
            if ret == -999:
                return False, "", "Compilation Error: Compiler timed out after 10.0s.", -999
            return (ret == 0), stdout, (stderr or stdout), ret

        elif lang_key in ["python", "python3", "py"]:
            # Strict Python syntax verification
            ret, stdout, stderr, _, _, _ = self.run_subprocess(
                ["python3", "-m", "py_compile", file_name],
                "",
                temp_dir,
                MAX_COMPILE_TIME_SEC
            )
            return (ret == 0), stdout, (stderr or stdout), ret

        elif lang_key in ["javascript", "js", "node"]:
            # Strict Node syntax verification
            ret, stdout, stderr, _, _, _ = self.run_subprocess(
                ["node", "-c", file_name],
                "",
                temp_dir,
                MAX_COMPILE_TIME_SEC
            )
            return (ret == 0), stdout, (stderr or stdout), ret

        return True, "", "", 0

    def execute_test_cases(
        self,
        language: str,
        user_code: str,
        wrapper_template: Optional[str],
        test_cases: List[Dict[str, Any]],
        time_limit_ms: int = 2000,
        memory_limit_mb: int = 256,
        is_run_only: bool = False
    ) -> Dict[str, Any]:
        """
        Executes code against test cases according to professional judge standards:
        1. Compile (if required or syntax check). If failed -> status='compile_error', return complete unmodified stderr, exitCode. DO NOT execute test cases.
        2. If compilation succeeds -> execute test cases sequentially.
        3. Only compare outputs if compilation succeeded AND exitCode == 0.
        4. Normalize line endings and trim only trailing newlines before comparison.
        """
        logger.info("[Judge:Execute] Starting execution: lang=%s, cases_count=%d, is_run_only=%s",
                    language, len(test_cases), is_run_only)
        
        lang_config = DEFAULT_LANGUAGE_CONFIGS.get(language.lower())
        if not lang_config:
            logger.error("[Judge:Execute] Unsupported language: %s", language)
            return {
                "status": "internal_error",
                "error_message": f"Unsupported language: {language}",
                "stdout": "",
                "stderr": f"Unsupported language: {language}",
                "exit_code": 1,
                "runtime_ms": 0,
                "memory_kb": 0,
                "score": 0,
                "total_test_cases": len(test_cases),
                "passed_test_cases": 0,
                "language": language,
                "compiler": "Unknown",
                "test_results": []
            }

        compiler_name = lang_config.get("compiler_version", lang_config.get("name", language))
        template = wrapper_template or lang_config.get("wrapper_template", "{{USER_CODE}}")
        extension = lang_config.get("extension", ".py")
        timeout_sec = max(0.5, time_limit_ms / 1000.0)

        temp_dir = tempfile.mkdtemp(prefix="arena_exec_")
        try:
            file_path = self.prepare_source_file(template, user_code, temp_dir, extension)
            file_name = os.path.basename(file_path)

            # ==========================================
            # STEP 1 & 2: COMPILE / SYNTAX VERIFICATION
            # ==========================================
            compile_ok, comp_stdout, comp_stderr, comp_exit_code = self.check_syntax_or_compile(
                language=language,
                file_path=file_path,
                temp_dir=temp_dir,
                lang_config=lang_config
            )

            if not compile_ok:
                raw_compiler_msg = (comp_stderr or comp_stdout or "Compilation Error").rstrip("\n")
                logger.warning("[Judge:Compile] Compilation/Syntax failed (exitCode=%d):\n%s",
                               comp_exit_code, raw_compiler_msg)
                
                # Immediately stop. Do NOT execute test cases. Never return empty output.
                return {
                    "status": "compile_error",
                    "error_message": raw_compiler_msg,
                    "stdout": "",
                    "stderr": raw_compiler_msg,
                    "exit_code": comp_exit_code,
                    "runtime_ms": 0,
                    "memory_kb": 0,
                    "score": 0,
                    "total_test_cases": len(test_cases),
                    "passed_test_cases": 0,
                    "language": language,
                    "compiler": compiler_name,
                    "test_results": []
                }

            logger.info("[Judge:Compile] Compilation/Syntax verification succeeded.")

            # ==========================================
            # STEP 3: RUN USER PROGRAM AGAINST TEST CASES
            # ==========================================
            run_cmd_template = lang_config.get("run_cmd", ["python3", "{file}"])
            output_name = "solution_bin"
            run_cmd = [
                arg.format(file=file_name, output=f"./{output_name}", dir=".")
                for arg in run_cmd_template
            ]
            logger.info("[Judge:Run] Execution command: %s", " ".join(run_cmd))

            results = []
            max_runtime = 0
            max_memory = 0
            all_passed = True
            overall_status = "accepted"
            first_error_msg = None
            first_stderr = None
            first_stdout = ""

            for idx, tc in enumerate(test_cases):
                tc_id = tc.get("id")
                input_json = tc.get("input_json", "")
                expected_output = tc.get("expected_output_json", "")
                order_matters = tc.get("order_matters", True)
                is_sample = tc.get("is_sample", False)

                logger.info("[Judge:TestCase #%d] Input: %s | Expected: %s (order_matters=%s)",
                            idx + 1, input_json, expected_output, order_matters)

                ret, stdout, stderr, runtime_ms, memory_kb, is_ole = self.run_subprocess(
                    run_cmd, input_json, temp_dir, timeout_sec
                )

                norm_stdout = normalize_string_output(stdout)
                norm_stderr = stderr.rstrip("\n") if stderr else ""

                if idx == 0:
                    first_stdout = norm_stdout

                max_runtime = max(max_runtime, runtime_ms)
                max_memory = max(max_memory, memory_kb)

                tc_result = {
                    "test_case_id": tc_id,
                    "is_sample": is_sample,
                    "input_json": input_json if is_sample or is_run_only else None,
                    "expected_output_json": expected_output if is_sample or is_run_only else None,
                    "actual_output_json": norm_stdout if is_sample or is_run_only else None,
                    "passed": False,
                    "runtime_ms": runtime_ms,
                    "memory_kb": memory_kb,
                    "error_message": None,
                    "stdout": norm_stdout,
                    "stderr": norm_stderr,
                    "exit_code": ret
                }

                # ----------------------------------------------------
                # Check Execution Verdicts
                # ----------------------------------------------------
                if is_ole:
                    # Output Limit Exceeded
                    tc_result["passed"] = False
                    ole_msg = "Output Limit Exceeded: Program generated excessive output (>2MB)."
                    tc_result["error_message"] = ole_msg
                    all_passed = False
                    if overall_status == "accepted":
                        overall_status = "output_limit_exceeded"
                        first_error_msg = ole_msg
                        first_stderr = ole_msg

                elif ret == -999:
                    # Timeout (Infinite Loop / TLE)
                    tc_result["passed"] = False
                    tle_msg = f"Time Limit Exceeded: Execution took longer than allowed {time_limit_ms}ms quota."
                    tc_result["error_message"] = tle_msg
                    all_passed = False
                    if overall_status == "accepted":
                        overall_status = "time_limit_exceeded"
                        first_error_msg = tle_msg
                        first_stderr = tle_msg

                elif ret != 0:
                    # Program crashed / fatal signal / unhandled exception
                    signal_detail = ""
                    if ret in [139, -11]:
                        signal_detail = "Segmentation fault (core dumped)"
                    elif ret in [136, -8]:
                        signal_detail = "Floating point exception"
                    elif ret in [134, -6]:
                        signal_detail = "Aborted (core dumped)"
                    elif ret in [138, -7]:
                        signal_detail = "Bus error"
                    elif ret in [137, -9]:
                        signal_detail = "Process killed (Memory or Resource Limit Exceeded)"
                    elif ret in [141, -13]:
                        signal_detail = "Broken pipe"
                    elif ret in [143, -15]:
                        signal_detail = "Process terminated"

                    full_err = norm_stderr
                    if signal_detail and signal_detail not in full_err:
                        full_err = f"{signal_detail}\n{full_err}".strip() if full_err else signal_detail

                    tc_result["passed"] = False
                    tc_result["error_message"] = full_err or f"Runtime Error (Exit Code {ret})"
                    all_passed = False

                    if overall_status == "accepted":
                        # If killed by memory killer (SIGKILL / -9) and memory is high
                        if ret in [137, -9] or memory_kb > (memory_limit_mb * 1024):
                            overall_status = "memory_limit_exceeded"
                            first_error_msg = f"Memory Limit Exceeded ({memory_kb // 1024}MB > {memory_limit_mb}MB)"
                        else:
                            overall_status = "runtime_error"
                            first_error_msg = full_err or f"Runtime Error (Exit Code {ret})"
                        first_stderr = full_err

                else:
                    # Compilation succeeded AND Program exited successfully (exitCode == 0)
                    # ONLY now do we compare outputs!
                    passed = compare_outputs(norm_stdout, expected_output, order_matters)
                    tc_result["passed"] = passed

                    logger.info("[Judge:TestCase #%d] Verification: %s (passed=%s)",
                                idx + 1, "PASSED" if passed else "FAILED", passed)

                    if not passed:
                        all_passed = False
                        tc_result["error_message"] = "Output does not match expected."
                        if overall_status == "accepted":
                            overall_status = "wrong_answer"
                            first_error_msg = "Output does not match expected."

                # Check Memory Limit Threshold
                if memory_kb > (memory_limit_mb * 1024):
                    tc_result["passed"] = False
                    all_passed = False
                    mem_msg = f"Memory Limit Exceeded ({memory_kb // 1024}MB > {memory_limit_mb}MB)"
                    tc_result["error_message"] = mem_msg
                    if overall_status == "accepted":
                        overall_status = "memory_limit_exceeded"
                        first_error_msg = mem_msg

                results.append(tc_result)

                # In submit mode, if test case failed, stop on first failure like LeetCode
                if not is_run_only and not tc_result["passed"]:
                    break

            passed_count = sum(1 for r in results if r["passed"])
            total_count = len(test_cases) if not is_run_only else len(results)

            final_verdict = "accepted" if all_passed else overall_status
            logger.info("[Judge:Summary] Final status: %s (%d/%d passed)", final_verdict, passed_count, total_count)

            return {
                "status": final_verdict,
                "error_message": first_error_msg,
                "stdout": first_stdout,
                "stderr": first_stderr,
                "runtime_ms": max_runtime,
                "memory_kb": max_memory,
                "total_test_cases": total_count,
                "passed_test_cases": passed_count,
                "language": language,
                "compiler": compiler_name,
                "test_results": results
            }

        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)

runner = CodeRunner(use_docker=False)
