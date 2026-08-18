import sys
import os
import time
import signal

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.judge.docker_runner import runner
from app.judge.normalizer import compare_outputs, normalize_string_output, values_match

def run_comprehensive_judge_test_suite():
    print("================================================================================")
    print("        CODE ARENA PRODUCTION ONLINE JUDGE 50-TEST VALIDATION SUITE             ")
    print("================================================================================")

    passed_count = 0
    total_count = 0

    def record_test(name: str, passed: bool, detail: str = ""):
        nonlocal passed_count, total_count
        total_count += 1
        if passed:
            passed_count += 1
            print(f"  [PASS {total_count:02d}] {name}")
        else:
            print(f"  [FAIL {total_count:02d}] {name} -> {detail}")
            raise AssertionError(f"Test failed: {name} ({detail})")

    # ============================================================================
    # SECTION 1: PYTHON COMPILATION & SYNTAX ERRORS
    # ============================================================================
    print("\n--- Section 1: Python Compilation & Syntax Errors ---")

    # 1. Syntax Error
    res = runner.execute_test_cases(
        language="python",
        user_code="def solve(nums):\n    if True\n        return 1\n",
        wrapper_template=None,
        test_cases=[{"id": "1", "input_json": "[1, 2]", "expected_output_json": "1", "is_sample": True}]
    )
    record_test("Python SyntaxError detection", res["status"] == "compile_error" and len(res["test_results"]) == 0 and "SyntaxError" in res["error_message"])

    # 2. Indentation Error
    res = runner.execute_test_cases(
        language="python",
        user_code="def solve(nums):\nreturn 1\n",
        wrapper_template=None,
        test_cases=[{"id": "1", "input_json": "[1, 2]", "expected_output_json": "1", "is_sample": True}]
    )
    record_test("Python IndentationError detection", res["status"] == "compile_error" and "IndentationError" in res["error_message"])

    # 3. Empty user program
    res = runner.execute_test_cases(
        language="python",
        user_code="",
        wrapper_template=None,
        test_cases=[{"id": "1", "input_json": "[1, 2]", "expected_output_json": "1", "is_sample": True}]
    )
    record_test("Python Empty program handling", res["status"] in ["compile_error", "runtime_error"])

    # ============================================================================
    # SECTION 2: PYTHON RUNTIME ERRORS & EXCEPTIONS
    # ============================================================================
    print("\n--- Section 2: Python Runtime Exceptions ---")

    # 4. ZeroDivisionError
    res = runner.execute_test_cases(
        language="python",
        user_code="def solve(nums):\n    return 10 / 0\n",
        wrapper_template=None,
        test_cases=[{"id": "1", "input_json": "[1]", "expected_output_json": "10", "is_sample": True}]
    )
    record_test("Python ZeroDivisionError", res["status"] == "runtime_error" and "ZeroDivisionError" in res["error_message"])

    # 5. NameError (Undeclared Variable)
    res = runner.execute_test_cases(
        language="python",
        user_code="def solve(nums):\n    return undeclared_var_xyz + 1\n",
        wrapper_template=None,
        test_cases=[{"id": "1", "input_json": "[1]", "expected_output_json": "1", "is_sample": True}]
    )
    record_test("Python NameError", res["status"] == "runtime_error" and "NameError" in res["error_message"])

    # 6. TypeError
    res = runner.execute_test_cases(
        language="python",
        user_code="def solve(nums):\n    return 'hello' + 123\n",
        wrapper_template=None,
        test_cases=[{"id": "1", "input_json": "[1]", "expected_output_json": "1", "is_sample": True}]
    )
    record_test("Python TypeError", res["status"] == "runtime_error" and "TypeError" in res["error_message"])

    # 7. IndexError
    res = runner.execute_test_cases(
        language="python",
        user_code="def solve(nums):\n    return nums[9999]\n",
        wrapper_template=None,
        test_cases=[{"id": "1", "input_json": "[[1, 2]]", "expected_output_json": "1", "is_sample": True}]
    )
    record_test("Python IndexError", res["status"] == "runtime_error" and "IndexError" in res["error_message"])

    # 8. KeyError
    res = runner.execute_test_cases(
        language="python",
        user_code="def solve(nums):\n    d = {}\n    return d['non_existent_key']\n",
        wrapper_template=None,
        test_cases=[{"id": "1", "input_json": "[1]", "expected_output_json": "1", "is_sample": True}]
    )
    record_test("Python KeyError", res["status"] == "runtime_error" and "KeyError" in res["error_message"])

    # 9. RecursionError (Maximum recursion depth)
    res = runner.execute_test_cases(
        language="python",
        user_code="def solve(nums):\n    def rec(): return rec()\n    return rec()\n",
        wrapper_template=None,
        test_cases=[{"id": "1", "input_json": "[1]", "expected_output_json": "1", "is_sample": True}]
    )
    record_test("Python RecursionError", res["status"] == "runtime_error" and "RecursionError" in res["error_message"])

    # 10. ImportError
    res = runner.execute_test_cases(
        language="python",
        user_code="def solve(nums):\n    import non_existent_secret_module_123\n    return 1\n",
        wrapper_template=None,
        test_cases=[{"id": "1", "input_json": "[1]", "expected_output_json": "1", "is_sample": True}]
    )
    record_test("Python ModuleNotFoundError/ImportError", res["status"] == "runtime_error" and ("ImportError" in res["error_message"] or "ModuleNotFoundError" in res["error_message"]))

    # 11. ValueError
    res = runner.execute_test_cases(
        language="python",
        user_code="def solve(nums):\n    return int('not_a_valid_number')\n",
        wrapper_template=None,
        test_cases=[{"id": "1", "input_json": "[1]", "expected_output_json": "1", "is_sample": True}]
    )
    record_test("Python ValueError", res["status"] == "runtime_error" and "ValueError" in res["error_message"])

    # ============================================================================
    # SECTION 3: TIME, MEMORY & OUTPUT LIMITS
    # ============================================================================
    print("\n--- Section 3: Time, Memory & Output Limits ---")

    # 12. Infinite Loop / Time Limit Exceeded (0.5s limit)
    res = runner.execute_test_cases(
        language="python",
        user_code="def solve(nums):\n    while True:\n        pass\n",
        wrapper_template=None,
        test_cases=[{"id": "1", "input_json": "[1]", "expected_output_json": "1", "is_sample": True}],
        time_limit_ms=500
    )
    record_test("Infinite Loop / Time Limit Exceeded (TLE)", res["status"] == "time_limit_exceeded" and res["runtime_ms"] >= 400)

    # 13. Output Limit Exceeded (OLE)
    res = runner.execute_test_cases(
        language="python",
        user_code="def solve(nums):\n    import sys\n    sys.stdout.write('A' * (3 * 1024 * 1024))\n    return 1\n",
        wrapper_template=None,
        test_cases=[{"id": "1", "input_json": "[1]", "expected_output_json": "1", "is_sample": True}]
    )
    record_test("Output Limit Exceeded (OLE) protection", res["status"] == "output_limit_exceeded" or "Output Limit Exceeded" in str(res))

    # 14. Both stdout (debug print) AND stderr (exception) preserved
    res = runner.execute_test_cases(
        language="python",
        user_code="def solve(nums):\n    print('DEBUG_LOG_ABC')\n    raise ValueError('CUSTOM_EXCEPTION_XYZ')\n",
        wrapper_template=None,
        test_cases=[{"id": "1", "input_json": "[1]", "expected_output_json": "1", "is_sample": True}]
    )
    record_test("Preserve both stdout and stderr on exception", "DEBUG_LOG_ABC" in res["test_results"][0]["stdout"] and "CUSTOM_EXCEPTION_XYZ" in res["error_message"])

    # ============================================================================
    # SECTION 4: OUTPUT NORMALIZATION & COMPARISON RULES
    # ============================================================================
    print("\n--- Section 4: Output Normalization & Float Tolerances ---")

    # 15. Line ending normalization (CRLF -> LF)
    record_test("Line ending normalization (CRLF -> LF)", normalize_string_output("line 1\r\nline 2\r\n\r\n") == "line 1\nline 2")

    # 16. Preserve indentation inside lines
    record_test("Preserve indentation inside lines", normalize_string_output("   indent 1\n   indent 2\n") == "   indent 1\n   indent 2")

    # 17. Absolute float tolerance (1e-5)
    record_test("Float comparison absolute tolerance (3.1415926 vs 3.1415930)", compare_outputs("3.1415926", "3.1415930"))

    # 18. Relative float tolerance on large numbers
    record_test("Float comparison relative tolerance on large numbers", values_match(1000000.001, 1000000.002))

    # 19. Float tolerance failure on large gap
    record_test("Float tolerance failure on large gap", not compare_outputs("3.140", "3.150"))

    # 20. Order-independent nested arrays (3Sum style)
    record_test("Order-independent nested arrays (3Sum)", compare_outputs("[[-1, 0, 1], [-1, -1, 2]]", "[[-1, -1, 2], [-1, 0, 1]]", order_matters=False))

    # 21. Order-dependent arrays (Two Sum style)
    record_test("Order-dependent arrays mismatch detection", not compare_outputs("[0, 1]", "[1, 0]", order_matters=True))

    # 22. Dictionary key ordering invariance
    record_test("Dictionary key ordering invariance", compare_outputs('{"a": 1, "b": 2}', '{"b": 2, "a": 1}'))

    # 23. Unicode / Emoji / Multi-language character support
    record_test("Unicode character comparison", compare_outputs('["🚀", "東京", "Москва"]', '["🚀", "東京", "Москва"]'))

    # 24. Empty list matching
    record_test("Empty list comparison", compare_outputs("[]", "[]"))

    # 25. Nested empty lists
    record_test("Nested empty lists comparison", compare_outputs("[[], []]", "[[], []]"))

    # 26. Boolean vs String strict distinction
    record_test("Strict JSON boolean vs string distinction", not compare_outputs("true", '"true"'))

    # 27. Number vs String strict distinction
    record_test("Strict JSON number vs string distinction", not compare_outputs("42", '"42"'))

    # 28. Multiple trailing newlines trimming
    record_test("Multiple trailing newlines stripped", normalize_string_output("result\r\n\r\n\n\n") == "result")

    # ============================================================================
    # SECTION 5: MULTIPLE TEST CASES & EVALUATION STRATEGIES
    # ============================================================================
    print("\n--- Section 5: Multiple Test Case Evaluation ---")

    # 29. Multi-test cases all passed
    res = runner.execute_test_cases(
        language="python",
        user_code="def solve(n): return n * 2\n",
        wrapper_template=None,
        test_cases=[
            {"id": "1", "input_json": "2", "expected_output_json": "4", "is_sample": True},
            {"id": "2", "input_json": "5", "expected_output_json": "10", "is_sample": True},
            {"id": "3", "input_json": "-3", "expected_output_json": "-6", "is_sample": True}
        ]
    )
    record_test("Multiple test cases: all passed -> Accepted", res["status"] == "accepted" and res["passed_test_cases"] == 3)

    # 30. Multi-test cases: second case wrong answer
    res = runner.execute_test_cases(
        language="python",
        user_code="def solve(n): return 4 if n == 2 else 999\n",
        wrapper_template=None,
        test_cases=[
            {"id": "1", "input_json": "2", "expected_output_json": "4", "is_sample": True},
            {"id": "2", "input_json": "5", "expected_output_json": "10", "is_sample": True}
        ]
    )
    record_test("Multiple test cases: second failed -> Wrong Answer", res["status"] == "wrong_answer" and res["passed_test_cases"] == 1)

    # 31. Submit mode: stop on first failure (LeetCode style)
    res = runner.execute_test_cases(
        language="python",
        user_code="def solve(n): return 999\n",
        wrapper_template=None,
        test_cases=[
            {"id": "1", "input_json": "2", "expected_output_json": "4", "is_sample": False},
            {"id": "2", "input_json": "5", "expected_output_json": "10", "is_sample": False},
            {"id": "3", "input_json": "8", "expected_output_json": "16", "is_sample": False}
        ],
        is_run_only=False
    )
    record_test("Submit mode halts on first failure", len(res["test_results"]) == 1 and res["status"] == "wrong_answer")

    # 32. Multi-argument unpacking
    res = runner.execute_test_cases(
        language="python",
        user_code="def solve(a, b, c): return a + b + c\n",
        wrapper_template=None,
        test_cases=[{"id": "1", "input_json": "[10, 20, 30]", "expected_output_json": "60", "is_sample": True}]
    )
    record_test("Multi-argument function unpacking", res["status"] == "accepted" and res["passed_test_cases"] == 1)

    # ============================================================================
    # SECTION 6: C++ COMPILATION & RUNTIME CHECKS
    # ============================================================================
    print("\n--- Section 6: C++ Compilation & Runtime Engine ---")

    # 33. C++ Syntax Error
    res = runner.execute_test_cases(
        language="cpp",
        user_code="class Solution { public: int solve() { return undeclared_identifier_err; } };\n",
        wrapper_template=None,
        test_cases=[{"id": "1", "input_json": "[]", "expected_output_json": "0", "is_sample": True}]
    )
    record_test("C++ Compilation Error (g++ diagnostics preserved)", res["status"] == "compile_error" and len(res["test_results"]) == 0 and "error:" in res["error_message"])

    # 34. C++ Valid Program
    res = runner.execute_test_cases(
        language="cpp",
        user_code="""
        class Solution {
        public:
            int solve(vector<int>& nums) {
                return nums.empty() ? 0 : nums[0] * 10;
            }
        };
        """,
        wrapper_template="""
        #include <iostream>
        #include <vector>
        #include <string>
        using namespace std;
        {{USER_CODE}}
        int main() {
            Solution s;
            vector<int> v = {5};
            cout << s.solve(v) << endl;
            return 0;
        }
        """,
        test_cases=[{"id": "1", "input_json": "[5]", "expected_output_json": "50", "is_sample": True}]
    )
    record_test("C++ Valid execution -> Accepted", res["status"] == "accepted")

    # 35. C++ Segmentation fault (SIGSEGV / exit 139)
    res = runner.execute_test_cases(
        language="cpp",
        user_code="""
        #include <csignal>
        int main() {
            raise(SIGSEGV);
            return 0;
        }
        """,
        wrapper_template="{{USER_CODE}}",
        test_cases=[{"id": "1", "input_json": "[]", "expected_output_json": "42", "is_sample": True}]
    )
    record_test("C++ Segmentation Fault (SIGSEGV) detection", res["status"] == "runtime_error" and ("Segmentation fault" in res["error_message"] or res["test_results"][0]["exit_code"] in [139, -11, -signal.SIGSEGV]))

    # 36. C++ Division by Zero (SIGFPE)
    res = runner.execute_test_cases(
        language="cpp",
        user_code="""
        #include <csignal>
        int main() {
            raise(SIGFPE);
            return 0;
        }
        """,
        wrapper_template="{{USER_CODE}}",
        test_cases=[{"id": "1", "input_json": "[]", "expected_output_json": "0", "is_sample": True}]
    )
    record_test("C++ Division by zero (SIGFPE) crash detection", res["status"] == "runtime_error")

    # 37. C++ Abort (SIGABRT)
    res = runner.execute_test_cases(
        language="cpp",
        user_code="""
        #include <cstdlib>
        int main() {
            abort();
            return 0;
        }
        """,
        wrapper_template="{{USER_CODE}}",
        test_cases=[{"id": "1", "input_json": "[]", "expected_output_json": "0", "is_sample": True}]
    )
    record_test("C++ Abort (SIGABRT) crash detection", res["status"] == "runtime_error" and ("Abort" in res["error_message"] or res["test_results"][0]["exit_code"] in [134, -6, -signal.SIGABRT]))

    # ============================================================================
    # SECTION 7: JAVASCRIPT (NODE.JS) ENGINE
    # ============================================================================
    print("\n--- Section 7: JavaScript (Node.js) Engine ---")

    # 38. JS Syntax Error
    res = runner.execute_test_cases(
        language="javascript",
        user_code="function solve(a, b) { if (true { return a; } }\n",
        wrapper_template=None,
        test_cases=[{"id": "1", "input_json": "[1, 2]", "expected_output_json": "1", "is_sample": True}]
    )
    record_test("JavaScript Syntax Error", res["status"] == "compile_error" and "SyntaxError" in res["error_message"])

    # 39. JS ReferenceError
    res = runner.execute_test_cases(
        language="javascript",
        user_code="function solve(a, b) { return undeclaredVar + 1; }\n",
        wrapper_template=None,
        test_cases=[{"id": "1", "input_json": "[1, 2]", "expected_output_json": "1", "is_sample": True}]
    )
    record_test("JavaScript ReferenceError", res["status"] == "runtime_error" and "ReferenceError" in res["error_message"])

    # 40. JS TypeError
    res = runner.execute_test_cases(
        language="javascript",
        user_code="function solve(a, b) { return null.propertyAccess(); }\n",
        wrapper_template=None,
        test_cases=[{"id": "1", "input_json": "[1, 2]", "expected_output_json": "1", "is_sample": True}]
    )
    record_test("JavaScript TypeError", res["status"] == "runtime_error" and "TypeError" in res["error_message"])

    # 41. JS Async Function & Promise Resolution
    res = runner.execute_test_cases(
        language="javascript",
        user_code="""
        async function solve(a, b) {
            return new Promise((resolve) => {
                setTimeout(() => resolve(a + b), 50);
            });
        }
        """,
        wrapper_template=None,
        test_cases=[{"id": "1", "input_json": "[10, 32]", "expected_output_json": "42", "is_sample": True}]
    )
    record_test("JavaScript Async function & Promise resolution", res["status"] == "accepted" and res["passed_test_cases"] == 1)

    # 42. JS Time Limit Exceeded (Infinite loop)
    res = runner.execute_test_cases(
        language="javascript",
        user_code="function solve(a) { while(true){} }\n",
        wrapper_template=None,
        test_cases=[{"id": "1", "input_json": "[1]", "expected_output_json": "1", "is_sample": True}],
        time_limit_ms=500
    )
    record_test("JavaScript Time Limit Exceeded (TLE)", res["status"] == "time_limit_exceeded")

    # 43. JS String manipulation
    res = runner.execute_test_cases(
        language="javascript",
        user_code="function solve(s) { return s.split('').reverse().join(''); }\n",
        wrapper_template=None,
        test_cases=[{"id": "1", "input_json": '"abcdef"', "expected_output_json": '"fedcba"', "is_sample": True}]
    )
    record_test("JavaScript String reverse execution -> Accepted", res["status"] == "accepted")

    # ============================================================================
    # SECTION 8: JAVA ENGINE & COMPILE CHECKS
    # ============================================================================
    print("\n--- Section 8: Java Engine & Compiler Checks ---")

    # 44. Java Compilation Error
    res = runner.execute_test_cases(
        language="java",
        user_code="public class InvalidSyntaxClass { void foo( { } }",
        wrapper_template="{{USER_CODE}}",
        test_cases=[{"id": "1", "input_json": "[]", "expected_output_json": "0", "is_sample": True}]
    )
    record_test("Java Compilation Error (javac errors captured)", res["status"] == "compile_error" and len(res["test_results"]) == 0)

    # ============================================================================
    # SECTION 9: LARGE SCALE INPUTS & ADVANCED EDGE CASES
    # ============================================================================
    print("\n--- Section 9: Large Scale Inputs & Metadata Verification ---")

    # 45. Very large input array (10,000 integers)
    large_input_list = list(range(10000))
    res = runner.execute_test_cases(
        language="python",
        user_code="def solve(nums): return len(nums)\n",
        wrapper_template=None,
        test_cases=[{"id": "1", "input_json": f"[{large_input_list}]", "expected_output_json": "10000", "is_sample": True}]
    )
    record_test("Large input array (10,000 items) processing", res["status"] == "accepted")

    # 46. Full judge metadata exposure
    res = runner.execute_test_cases(
        language="python",
        user_code="def solve(n): return n * 3\n",
        wrapper_template=None,
        test_cases=[{"id": "1", "input_json": "5", "expected_output_json": "15", "is_sample": True}]
    )
    has_metadata = (
        "language" in res and
        "compiler" in res and
        "status" in res and
        "runtime_ms" in res and
        "memory_kb" in res and
        "total_test_cases" in res and
        "passed_test_cases" in res
    )
    record_test("Full judge response metadata exposure", has_metadata and res["compiler"] != "Unknown")

    # 47. Boolean true / false comparison
    record_test("Boolean true/false comparison", compare_outputs("true", "true") and not compare_outputs("true", "false"))

    # 48. Null / None handling
    record_test("Null / None output comparison", compare_outputs("null", "null"))

    # 49. Raw string output matching (Non-JSON fallback)
    record_test("Raw non-JSON string exact matching", compare_outputs("SUCCESSFUL_TOKEN_999", "SUCCESSFUL_TOKEN_999"))

    # 50. Mixed test case results in sample evaluation mode
    res = runner.execute_test_cases(
        language="python",
        user_code="def solve(n):\n    if n == 1: return 10\n    elif n == 2: return 999\n    elif n == 3: raise RuntimeError('Error on 3')\n    return 0\n",
        wrapper_template=None,
        test_cases=[
            {"id": "1", "input_json": "1", "expected_output_json": "10", "is_sample": True},
            {"id": "2", "input_json": "2", "expected_output_json": "20", "is_sample": True},
            {"id": "3", "input_json": "3", "expected_output_json": "30", "is_sample": True}
        ],
        is_run_only=True
    )
    record_test("Mixed sample test results (1 pass, 1 wrong, 1 error)", len(res["test_results"]) == 3 and res["test_results"][0]["passed"] and not res["test_results"][1]["passed"] and not res["test_results"][2]["passed"])

    print("\n================================================================================")
    print(f"       TEST SUITE COMPLETE: {passed_count}/{total_count} PASSED (100% SUCCESS RATE)          ")
    print("================================================================================")

if __name__ == "__main__":
    run_comprehensive_judge_test_suite()
