# Code Execution & Judge Pipeline — Code Arena

The Judge Engine safely compiles and executes untrusted user-submitted code in isolated environments.

## Judge Pipeline Lifecycle

```mermaid
flowchart TD
    Start["User Submits Code (code, language, problem_id)"] --> FetchCfg["Fetch Problem Language Config & Wrapper Template"]
    FetchCfg --> Inject["Inject User Code into Wrapper Harness ({{USER_CODE}})"]
    Inject --> WriteScratch["Write to Temporary Sandbox File (solution.py / solution.cpp)"]
    
    WriteScratch --> CheckLang{"Compiled Language? (C++ / Java)"}
    CheckLang -- Yes --> Compile["Run Compiler (g++ / javac) with Timeout"]
    Compile -- Fail --> CompileErr["Verdict: Compile Error (return build diagnostics)"]
    Compile -- Success --> Exec
    CheckLang -- No --> Exec["Spawn Sandboxed Runner"]

    Exec --> Constraints["Apply Sandbox Constraints:<br/>• --network none<br/>• --memory 256m<br/>• --cpus 1.0<br/>• tmpfs /sandbox:rw<br/>• non-root user (uid 1000)<br/>• hard wall-clock timeout"]
    
    Constraints --> RunTests["Feed Test Case JSON via stdin"]
    RunTests --> ProcessOutput{"Process Exit & Output"}

    ProcessOutput -- Timeout Exceeded --> TLE["Verdict: Time Limit Exceeded"]
    ProcessOutput -- Non-zero Exit --> RTE["Verdict: Runtime Error (stderr)"]
    ProcessOutput -- OOM / Memory Exceeded --> MLE["Verdict: Memory Limit Exceeded"]
    ProcessOutput -- Zero Exit --> Normalize["Canonical Normalization & deep_sort (order_matters flag)"]

    Normalize -- Output Matches --> Passed["Case Passed"]
    Normalize -- Output Differs --> WA["Verdict: Wrong Answer"]

    Passed --> AllCases{"More Cases Remaining?"}
    AllCases -- Yes --> RunTests
    AllCases -- No --> Accepted["Final Verdict: Accepted (Score & Streak Updated)"]
```

## Normalization and Order Independence
For problems such as *Group Anagrams* or *Subsets*, the relative ordering of outer and inner lists may vary across algorithms while remaining strictly correct. The normalizer provides recursive `deep_sort` capability:
- If `order_matters = False`, sublists and dictionaries are canonically sorted prior to equality validation.
- Floating-point outputs are rounded to 6 decimal places to prevent IEEE 754 precision mismatches.
