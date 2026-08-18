from typing import Dict, Any

DEFAULT_LANGUAGE_CONFIGS: Dict[str, Dict[str, Any]] = {
    "python": {
        "name": "Python 3.11",
        "extension": ".py",
        "docker_image": "judge-python:latest",
        "compiler_version": "Python 3.11.10",
        "starter_code": "def solve(*args):\n    # Write your solution here\n    pass\n",
        "wrapper_template": """import sys
import json

# --- USER CODE START ---
{{USER_CODE}}
# --- USER CODE END ---

def __arena_entry__():
    try:
        raw_input = sys.stdin.read()
        if not raw_input.strip():
            return
        args = json.loads(raw_input)
        
        # Look for user solve function
        if 'solve' in globals() and callable(globals()['solve']):
            fn = globals()['solve']
        elif 'solution' in globals() and callable(globals()['solution']):
            fn = globals()['solution']
        elif 'Solution' in globals() and hasattr(globals()['Solution'], 'solve'):
            fn = globals()['Solution']().solve
        else:
            # Pick first non-dunder callable
            candidates = [v for k, v in globals().items() if callable(v) and not k.startswith('_') and k != '__arena_entry__']
            if candidates:
                fn = candidates[0]
            else:
                raise RuntimeError("No callable solution function found (e.g. def solve(...))")

        if isinstance(args, list):
            res = fn(*args)
        elif isinstance(args, dict):
            res = fn(**args)
        else:
            res = fn(args)

        sys.stdout.write(json.dumps(res, default=str) + "\\n")
        sys.stdout.flush()
    except Exception as e:
        import traceback
        traceback.print_exc(file=sys.stderr)
        sys.stderr.flush()
        sys.exit(1)

if __name__ == '__main__':
    __arena_entry__()
""",
        "compile_cmd": None,
        "run_cmd": ["python3", "{file}"]
    },
    "javascript": {
        "name": "JavaScript (Node.js 20)",
        "extension": ".js",
        "docker_image": "judge-node:latest",
        "compiler_version": "Node.js v20.19.6",
        "starter_code": "function solve(...args) {\n    // Write your solution here\n}\n",
        "wrapper_template": """const fs = require('fs');

// --- USER CODE START ---
{{USER_CODE}}
// --- USER CODE END ---

async function __arena_entry__() {
    try {
        const rawInput = fs.readFileSync(0, 'utf-8');
        if (!rawInput.trim()) return;
        const args = JSON.parse(rawInput);
        
        let fn = null;
        if (typeof solve === 'function') {
            fn = solve;
        } else if (typeof solution === 'function') {
            fn = solution;
        } else if (typeof Solution === 'function' && typeof (new Solution()).solve === 'function') {
            fn = (...a) => (new Solution()).solve(...a);
        } else {
            throw new Error("No callable solution function found (e.g. function solve(...))");
        }

        let res;
        if (Array.isArray(args)) {
            res = await Promise.resolve(fn(...args));
        } else {
            res = await Promise.resolve(fn(args));
        }

        process.stdout.write(JSON.stringify(res) + "\\n");
    } catch (err) {
        console.error(err.stack || err.message);
        process.exit(1);
    }
}

__arena_entry__();
""",
        "compile_cmd": None,
        "run_cmd": ["node", "{file}"]
    },
    "cpp": {
        "name": "C++ (g++ 17)",
        "extension": ".cpp",
        "docker_image": "judge-cpp:latest",
        "compiler_version": "g++ (GCC) 17.0.0 (C++17)",
        "starter_code": """#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <unordered_map>

using namespace std;

class Solution {
public:
    // Implement your solution
};
""",
        "wrapper_template": """#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <unordered_map>

using namespace std;

// --- USER CODE START ---
{{USER_CODE}}
// --- USER CODE END ---

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    return 0;
}
""",
        "compile_cmd": ["g++", "-O2", "-std=c++17", "{file}", "-o", "{output}"],
        "run_cmd": ["{output}"]
    },
    "java": {
        "name": "Java (OpenJDK 17)",
        "extension": ".java",
        "docker_image": "judge-java:latest",
        "compiler_version": "OpenJDK 17.0.10",
        "starter_code": """import java.util.*;

class Solution {
    // Implement your solution
}
""",
        "wrapper_template": """import java.util.*;
import java.io.*;

// --- USER CODE START ---
{{USER_CODE}}
// --- USER CODE END ---

public class Main {
    public static void main(String[] args) {
        System.out.flush();
    }
}
""",
        "compile_cmd": ["javac", "{file}"],
        "run_cmd": ["java", "-cp", "{dir}", "Main"]
    }
}
