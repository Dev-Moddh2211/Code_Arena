from datetime import date
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.user import User
from app.models.problem import Problem, ProblemLanguageConfig, TestCase, Hint
from app.models.sheet import Sheet, SheetProblem
from app.models.daily_challenge import DailyChallenge
from app.models.achievement import Achievement
from app.judge.language_configs import DEFAULT_LANGUAGE_CONFIGS
from app.judge.wrappers import get_cpp_wrapper, get_java_wrapper


# Exact 10 Problems from Code Arena Problem Bank v2
SAMPLE_PROBLEMS = [
    # 1. Signal Pair
    {
        "slug": "signal-pair",
        "title": "Signal Pair",
        "difficulty": "easy",
        "points": 10,
        "topic_tags": ["Array", "Hash Map"],
        "company_tags": ["Google", "Amazon"],
        "description_md": """Given an array of integers `readings` and an integer `target`, return indices of the two numbers such that they add up to `target`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice. You can return the answer in any order.

### Example 1:
```text
Input: readings = [4, 9, 2, 13], target = 11
Output: [1, 2]
Explanation: readings[1] + readings[2] = 9 + 2 = 11.
```

### Example 2:
```text
Input: readings = [5, 3, 7], target = 10
Output: [1, 2]
```

### Example 3:
```text
Input: readings = [6, 6], target = 12
Output: [0, 1]
```
""",
        "constraints_md": """- $2 \\le \\text{readings.length} \\le 10^4$
- $-10^9 \\le \\text{readings}[i] \\le 10^9$
- $-10^9 \\le \\text{target} \\le 10^9$
- Exactly one valid pair exists.
""",
        "editorial_md": """### Approach: Hash Map (Single Pass)

Walk the array once, keeping a hash map of value $\\to$ index seen so far. At each reading, check whether `target - reading` is already in the map; if so, return that stored index and the current index. Otherwise insert the current reading and continue.

#### Complexity:
- **Time Complexity:** $O(n)$
- **Space Complexity:** $O(n)$
""",
        "hints": [
            "Walk the array while keeping a hash map of value -> index seen so far.",
            "At each element, check whether target - reading is already in the map."
        ],
        "test_cases": [
            {"input_json": "[[4,9,2,13], 11]", "expected_output_json": "[1,2]", "is_sample": True, "order_matters": False},
            {"input_json": "[[5,3,7], 10]", "expected_output_json": "[1,2]", "is_sample": True, "order_matters": False},
            {"input_json": "[[6,6], 12]", "expected_output_json": "[0,1]", "is_sample": False, "order_matters": False},
            {"input_json": "[[10,-3,2,5,-7], -1]", "expected_output_json": "[1,2]", "is_sample": False, "order_matters": False},
            {"input_json": "[[-3,4,3,90], 0]", "expected_output_json": "[0,2]", "is_sample": False, "order_matters": False},
            {"input_json": "[[10,-5,20,-15,8], -20]", "expected_output_json": "[1,3]", "is_sample": False, "order_matters": False}
        ],
        "python_starter": "from typing import List\n\ndef solve(readings: List[int], target: int) -> List[int]:\n    # your code here\n    return []\n",
        "js_starter": "function solve(readings, target) {\n    // your code here\n    return [];\n}\n",
        "cpp_starter": "#include <vector>\nusing namespace std;\n\nvector<int> solve(vector<int>& readings, int target) {\n    // your code here\n    return {};\n}\n",
        "java_starter": "import java.util.*;\n\nclass Solution {\n    public int[] solve(int[] readings, int target) {\n        // your code here\n        return new int[]{};\n    }\n}\n"
    },

    # 2. Best Trade Window
    {
        "slug": "best-trade-window",
        "title": "Best Trade Window",
        "difficulty": "easy",
        "points": 10,
        "topic_tags": ["Array", "Greedy", "Dynamic Programming"],
        "company_tags": ["Amazon", "Meta"],
        "description_md": """You are given an array `prices` where `prices[i]` is the price of a given stock on the $i^{\\text{th}}$ day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return `0`.

### Example 1:
```text
Input: prices = [7,1,5,3,6,4]
Output: 5
Explanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5.
```

### Example 2:
```text
Input: prices = [7,6,4,3,1]
Output: 0
Explanation: In this case, no transactions are done and the max profit = 0.
```
""",
        "constraints_md": """- $1 \\le \\text{prices.length} \\le 10^5$
- $0 \\le \\text{prices}[i] \\le 10^4$
""",
        "editorial_md": """### Approach: One Pass (Running Minimum)

Track the lowest price seen so far while scanning left to right. At each day, compute the profit from selling today against that running minimum, and keep the best profit seen.

#### Complexity:
- **Time Complexity:** $O(n)$
- **Space Complexity:** $O(1)$
""",
        "hints": [
            "Track the lowest price seen so far while scanning left to right.",
            "At each step, calculate the difference between the current price and the minimum price."
        ],
        "test_cases": [
            {"input_json": "[[7,1,5,3,6,4]]", "expected_output_json": "5", "is_sample": True, "order_matters": True},
            {"input_json": "[[7,6,4,3,1]]", "expected_output_json": "0", "is_sample": True, "order_matters": True},
            {"input_json": "[[2,4,1,7]]", "expected_output_json": "6", "is_sample": False, "order_matters": True},
            {"input_json": "[[1]]", "expected_output_json": "0", "is_sample": False, "order_matters": True},
            {"input_json": "[[3,8,1,9,2]]", "expected_output_json": "8", "is_sample": False, "order_matters": True},
            {"input_json": "[[5]]", "expected_output_json": "0", "is_sample": False, "order_matters": True}
        ],
        "python_starter": "from typing import List\n\ndef solve(prices: List[int]) -> int:\n    # your code here\n    return 0\n",
        "js_starter": "function solve(prices) {\n    // your code here\n    return 0;\n}\n",
        "cpp_starter": "#include <vector>\nusing namespace std;\n\nint solve(vector<int>& prices) {\n    // your code here\n    return 0;\n}\n",
        "java_starter": "class Solution {\n    public int solve(int[] prices) {\n        // your code here\n        return 0;\n    }\n}\n"
    },

    # 3. Everyone Except Me
    {
        "slug": "everyone-except-me",
        "title": "Everyone Except Me",
        "difficulty": "medium",
        "points": 30,
        "topic_tags": ["Array", "Prefix Sum"],
        "company_tags": ["Apple", "Amazon"],
        "description_md": """Given an integer array `multipliers`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `multipliers` except `multipliers[i]`.

The product of any prefix or suffix of `multipliers` is guaranteed to fit in a **32-bit** integer.

You must write an algorithm that runs in $O(n)$ time and without using the division operation.

### Example 1:
```text
Input: multipliers = [1,2,3,4]
Output: [24,12,8,6]
```

### Example 2:
```text
Input: multipliers = [-1,1,0,-3,3]
Output: [0,0,9,0,0]
```
""",
        "constraints_md": """- $2 \\le \\text{multipliers.length} \\le 10^5$
- $-30 \\le \\text{multipliers}[i] \\le 30$
- No division allowed; result guaranteed to fit in a 32-bit integer.
""",
        "editorial_md": """### Approach: Prefix and Suffix Products

Build a left-to-right prefix-product array and a right-to-left suffix-product array, then multiply `prefix[i-1] * suffix[i+1]` for each index. Both passes can be collapsed into a single output array plus one running variable to hit $O(1)$ extra space (excluding the output).

#### Complexity:
- **Time Complexity:** $O(n)$
- **Space Complexity:** $O(1)$ extra space
""",
        "hints": [
            "Can you compute prefix products from the left and suffix products from the right?",
            "Combine prefix[i-1] and suffix[i+1] without using division."
        ],
        "test_cases": [
            {"input_json": "[[1,2,3,4]]", "expected_output_json": "[24,12,8,6]", "is_sample": True, "order_matters": True},
            {"input_json": "[[-1,1,0,-3,3]]", "expected_output_json": "[0,0,9,0,0]", "is_sample": True, "order_matters": True},
            {"input_json": "[[2,3]]", "expected_output_json": "[3,2]", "is_sample": False, "order_matters": True},
            {"input_json": "[[0,0]]", "expected_output_json": "[0,0]", "is_sample": False, "order_matters": True},
            {"input_json": "[[2,0,4,0]]", "expected_output_json": "[0,0,0,0]", "is_sample": False, "order_matters": True},
            {"input_json": "[[-2,-3,-4]]", "expected_output_json": "[12,8,6]", "is_sample": False, "order_matters": True}
        ],
        "python_starter": "from typing import List\n\ndef solve(multipliers: List[int]) -> List[int]:\n    # your code here\n    return []\n",
        "js_starter": "function solve(multipliers) {\n    // your code here\n    return [];\n}\n",
        "cpp_starter": "#include <vector>\nusing namespace std;\n\nvector<int> solve(vector<int>& multipliers) {\n    // your code here\n    return {};\n}\n",
        "java_starter": "class Solution {\n    public int[] solve(int[] multipliers) {\n        // your code here\n        return new int[]{};\n    }\n}\n"
    },

    # 4. Best Continuous Streak
    {
        "slug": "best-continuous-streak",
        "title": "Best Continuous Streak",
        "difficulty": "medium",
        "points": 30,
        "topic_tags": ["Array", "Dynamic Programming"],
        "company_tags": ["Microsoft", "Google"],
        "description_md": """Given an integer array `deltas`, find the subarray with the largest sum, and return its sum.

A **subarray** is a contiguous non-empty sequence of elements within an array.

### Example 1:
```text
Input: deltas = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: The contiguous subarray [4,-1,2,1] has the largest sum 6.
```

### Example 2:
```text
Input: deltas = [5,4,-1,7,8]
Output: 23
Explanation: The contiguous subarray [5,4,-1,7,8] has the largest sum 23.
```
""",
        "constraints_md": """- $1 \\le \\text{deltas.length} \\le 10^5$
- $-10^4 \\le \\text{deltas}[i] \\le 10^4$
""",
        "editorial_md": """### Approach: Kadane's Algorithm

Kadane's algorithm — track `current_sum`, resetting it to the current element whenever extending the previous run would make things worse (`current_sum < 0`), and track the maximum `current_sum` seen.

#### Complexity:
- **Time Complexity:** $O(n)$
- **Space Complexity:** $O(1)$
""",
        "hints": [
            "If the current running sum becomes negative, it's better to restart the contiguous subarray from the next element.",
            "Keep track of the global maximum sum seen so far."
        ],
        "test_cases": [
            {"input_json": "[[-2,1,-3,4,-1,2,1,-5,4]]", "expected_output_json": "6", "is_sample": True, "order_matters": True},
            {"input_json": "[[5,4,-1,7,8]]", "expected_output_json": "23", "is_sample": True, "order_matters": True},
            {"input_json": "[[-1,-2,-3]]", "expected_output_json": "-1", "is_sample": False, "order_matters": True},
            {"input_json": "[[3,-2,5,-1]]", "expected_output_json": "6", "is_sample": False, "order_matters": True},
            {"input_json": "[[-5,-2,-8,-1]]", "expected_output_json": "-1", "is_sample": False, "order_matters": True},
            {"input_json": "[[10,-3,-4,15,-2]]", "expected_output_json": "18", "is_sample": False, "order_matters": True}
        ],
        "python_starter": "from typing import List\n\ndef solve(deltas: List[int]) -> int:\n    # your code here\n    return 0\n",
        "js_starter": "function solve(deltas) {\n    // your code here\n    return 0;\n}\n",
        "cpp_starter": "#include <vector>\nusing namespace std;\n\nint solve(vector<int>& deltas) {\n    // your code here\n    return 0;\n}\n",
        "java_starter": "class Solution {\n    public int solve(int[] deltas) {\n        // your code here\n        return 0;\n    }\n}\n"
    },

    # 5. Repeat Detector
    {
        "slug": "repeat-detector",
        "title": "Repeat Detector",
        "difficulty": "easy",
        "points": 10,
        "topic_tags": ["Array", "Hash Set"],
        "company_tags": ["Google"],
        "description_md": """Given an integer array `ids`, return `true` if any value appears **at least twice** in the array, and return `false` if every element is distinct.

### Example 1:
```text
Input: ids = [1,2,3,1]
Output: true
```

### Example 2:
```text
Input: ids = [1,2,3,4]
Output: false
```
""",
        "constraints_md": """- $1 \\le \\text{ids.length} \\le 10^5$
- $-10^9 \\le \\text{ids}[i] \\le 10^9$
""",
        "editorial_md": """### Approach: Hash Set

Insert each ID into a hash set; if an ID is already present when you try to insert it, return `true` immediately. If the scan finishes without a collision, return `false`.

#### Complexity:
- **Time Complexity:** $O(n)$
- **Space Complexity:** $O(n)$
""",
        "hints": [
            "Use a set to store visited transaction IDs.",
            "If an item already exists in the set during iteration, return true."
        ],
        "test_cases": [
            {"input_json": "[[1,2,3,1]]", "expected_output_json": "true", "is_sample": True, "order_matters": True},
            {"input_json": "[[1,2,3,4]]", "expected_output_json": "false", "is_sample": True, "order_matters": True},
            {"input_json": "[[7]]", "expected_output_json": "false", "is_sample": False, "order_matters": True},
            {"input_json": "[[5,5]]", "expected_output_json": "true", "is_sample": False, "order_matters": True},
            {"input_json": "[[42]]", "expected_output_json": "false", "is_sample": False, "order_matters": True},
            {"input_json": "[[0,-5,12,-5,8]]", "expected_output_json": "true", "is_sample": False, "order_matters": True}
        ],
        "python_starter": "from typing import List\n\ndef solve(ids: List[int]) -> bool:\n    # your code here\n    return False\n",
        "js_starter": "function solve(ids) {\n    // your code here\n    return false;\n}\n",
        "cpp_starter": "#include <vector>\nusing namespace std;\n\nbool solve(vector<int>& ids) {\n    // your code here\n    return false;\n}\n",
        "java_starter": "class Solution {\n    public boolean solve(int[] ids) {\n        // your code here\n        return false;\n    }\n}\n"
    },

    # 6. Triple Balance
    {
        "slug": "triple-balance",
        "title": "Triple Balance",
        "difficulty": "medium",
        "points": 30,
        "topic_tags": ["Array", "Two Pointers", "Sorting"],
        "company_tags": ["Meta", "Amazon"],
        "description_md": """Given an integer array `amounts`, return all the triplets `[amounts[i], amounts[j], amounts[k]]` such that `i != j`, `i != k`, and `j != k`, and `amounts[i] + amounts[j] + amounts[k] == 0`.

Notice that the solution set must not contain duplicate triplets.

### Example 1:
```text
Input: amounts = [-1,0,1,2,-1,-4]
Output: [[-1,-1,2],[-1,0,1]]
Explanation: 
amounts[0] + amounts[1] + amounts[2] = (-1) + 0 + 1 = 0.
amounts[1] + amounts[2] + amounts[4] = 0 + 1 + (-1) = 0.
amounts[0] + amounts[3] + amounts[4] = (-1) + 2 + (-1) = 0.
The distinct triplets are [-1,0,1] and [-1,-1,2].
```

### Example 2:
```text
Input: amounts = [0,1,1]
Output: []
Explanation: The only possible triplet does not sum up to 0.
```

### Example 3:
```text
Input: amounts = [0,0,0]
Output: [[0,0,0]]
Explanation: The only possible triplet sums up to 0.
```
""",
        "constraints_md": """- $3 \\le \\text{amounts.length} \\le 3000$
- $-10^5 \\le \\text{amounts}[i] \\le 10^5$
""",
        "editorial_md": """### Approach: Sort + Two Pointers

Sort the array, then for each index `i`, run a two-pointer scan over the remainder looking for pairs that sum to `-amounts[i]`, skipping duplicate values at each level to avoid duplicate triplets.

#### Complexity:
- **Time Complexity:** $O(n^2)$
- **Space Complexity:** $O(1)$ or $O(n)$ depending on sorting algorithm
""",
        "hints": [
            "Sort the array first to make duplicate handling and two-pointer search straightforward.",
            "For each fixed element, use two pointers (left and right) to find matching pairs."
        ],
        "test_cases": [
            {"input_json": "[[-1,0,1,2,-1,-4]]", "expected_output_json": "[[-1,-1,2],[-1,0,1]]", "is_sample": True, "order_matters": False},
            {"input_json": "[[0,1,1]]", "expected_output_json": "[]", "is_sample": True, "order_matters": False},
            {"input_json": "[[0,0,0]]", "expected_output_json": "[[0,0,0]]", "is_sample": False, "order_matters": False},
            {"input_json": "[[1,2,-2,-1]]", "expected_output_json": "[]", "is_sample": False, "order_matters": False},
            {"input_json": "[[-2,0,1,1,2]]", "expected_output_json": "[[-2,0,2],[-2,1,1]]", "is_sample": False, "order_matters": False},
            {"input_json": "[[-3,-1,1,2,4]]", "expected_output_json": "[[-3,-1,4],[-3,1,2]]", "is_sample": False, "order_matters": False}
        ],
        "python_starter": "from typing import List\n\ndef solve(amounts: List[int]) -> List[List[int]]:\n    # your code here\n    return []\n",
        "js_starter": "function solve(amounts) {\n    // your code here\n    return [];\n}\n",
        "cpp_starter": "#include <vector>\nusing namespace std;\n\nvector<vector<int>> solve(vector<int>& amounts) {\n    // your code here\n    return {};\n}\n",
        "java_starter": "import java.util.*;\n\nclass Solution {\n    public List<List<Integer>> solve(int[] amounts) {\n        // your code here\n        return new ArrayList<>();\n    }\n}\n"
    },

    # 7. Letter Match
    {
        "slug": "letter-match",
        "title": "Letter Match",
        "difficulty": "easy",
        "points": 10,
        "topic_tags": ["String", "Hash Map"],
        "company_tags": ["Uber", "Google"],
        "description_md": """Given two strings `a` and `b`, return `true` if `b` is an anagram of `a`, and `false` otherwise.

An **Anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.

### Example 1:
```text
Input: a = "anagram", b = "nagaram"
Output: true
```

### Example 2:
```text
Input: a = "rat", b = "car"
Output: false
```
""",
        "constraints_md": """- $1 \\le a.\\text{length}, b.\\text{length} \\le 5 \\times 10^4$
- Both strings contain only lowercase English letters.
""",
        "editorial_md": """### Approach: Frequency Array / Hash Table

If lengths differ, return `false` immediately. Otherwise build a 26-slot letter-frequency count from the first string, decrement it while scanning the second, and confirm every slot returns to zero.

#### Complexity:
- **Time Complexity:** $O(n)$
- **Space Complexity:** $O(1)$ (fixed alphabet of size 26)
""",
        "hints": [
            "Check if lengths are equal first.",
            "Count character frequencies using an array of size 26."
        ],
        "test_cases": [
            {"input_json": "[\"anagram\", \"nagaram\"]", "expected_output_json": "true", "is_sample": True, "order_matters": True},
            {"input_json": "[\"rat\", \"car\"]", "expected_output_json": "false", "is_sample": True, "order_matters": True},
            {"input_json": "[\"a\", \"a\"]", "expected_output_json": "true", "is_sample": False, "order_matters": True},
            {"input_json": "[\"ab\", \"a\"]", "expected_output_json": "false", "is_sample": False, "order_matters": True},
            {"input_json": "[\"listen\", \"silentt\"]", "expected_output_json": "false", "is_sample": False, "order_matters": True},
            {"input_json": "[\"apple\", \"papel\"]", "expected_output_json": "true", "is_sample": False, "order_matters": True}
        ],
        "python_starter": "def solve(a: str, b: str) -> bool:\n    # your code here\n    return False\n",
        "js_starter": "function solve(a, b) {\n    // your code here\n    return false;\n}\n",
        "cpp_starter": "#include <string>\nusing namespace std;\n\nbool solve(string a, string b) {\n    // your code here\n    return false;\n}\n",
        "java_starter": "class Solution {\n    public boolean solve(String a, String b) {\n        // your code here\n        return false;\n    }\n}\n"
    },

    # 8. Island Counter
    {
        "slug": "island-counter",
        "title": "Island Counter",
        "difficulty": "medium",
        "points": 30,
        "topic_tags": ["Graph", "BFS", "DFS", "Matrix"],
        "company_tags": ["Amazon", "Google", "Bloomberg"],
        "description_md": """Given an `m x n` 2D binary grid `grid` which represents a map of `'1'`s (land) and `'0'`s (water), return *the number of islands*.

An **island** is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.

### Example 1:
```text
Input: grid = [
  ["1","1","0","0"],
  ["1","0","0","1"],
  ["0","0","1","1"]
]
Output: 2
```

### Example 2:
```text
Input: grid = [
  ["1","1","1"],
  ["1","1","1"],
  ["1","1","1"]
]
Output: 1
```
""",
        "constraints_md": """- $1 \\le \\text{rows}, \\text{cols} \\le 300$
- Each cell is `"0"` or `"1"`.
""",
        "editorial_md": """### Approach: DFS / BFS Flood Fill

Scan every cell; whenever an unvisited `"1"` is found, flood-fill (DFS or BFS) outward to mark its entire connected landmass as visited (or convert to `"0"`), and increment a counter once per flood-fill triggered.

#### Complexity:
- **Time Complexity:** $O(\\text{rows} \\times \\text{cols})$
- **Space Complexity:** $O(\\text{rows} \\times \\text{cols})$
""",
        "hints": [
            "Iterate through each cell of the grid.",
            "When you encounter a '1', trigger a BFS or DFS to sink the connected island."
        ],
        "test_cases": [
            {"input_json": "[[[\"1\",\"1\",\"0\",\"0\"],[\"1\",\"0\",\"0\",\"1\"],[\"0\",\"0\",\"1\",\"1\"]]]", "expected_output_json": "2", "is_sample": True, "order_matters": True},
            {"input_json": "[[[\"1\",\"1\",\"1\"],[\"1\",\"1\",\"1\"],[\"1\",\"1\",\"1\"]]]", "expected_output_json": "1", "is_sample": True, "order_matters": True},
            {"input_json": "[[[\"0\",\"0\"],[\"0\",\"0\"]]]", "expected_output_json": "0", "is_sample": False, "order_matters": True},
            {"input_json": "[[[\"1\"]]]", "expected_output_json": "1", "is_sample": False, "order_matters": True},
            {"input_json": "[[[\"1\",\"0\"],[\"0\",\"1\"]]]", "expected_output_json": "2", "is_sample": False, "order_matters": True},
            {"input_json": "[[[\"0\",\"0\",\"0\"],[\"0\",\"0\",\"0\"]]]", "expected_output_json": "0", "is_sample": False, "order_matters": True}
        ],
        "python_starter": "from typing import List\n\ndef solve(grid: List[List[str]]) -> int:\n    # your code here\n    return 0\n",
        "js_starter": "function solve(grid) {\n    // your code here\n    return 0;\n}\n",
        "cpp_starter": "#include <vector>\nusing namespace std;\n\nint solve(vector<vector<char>>& grid) {\n    // your code here\n    return 0;\n}\n",
        "java_starter": "class Solution {\n    public int solve(char[][] grid) {\n        // your code here\n        return 0;\n    }\n}\n"
    },

    # 9. Non-Adjacent Loot
    {
        "slug": "non-adjacent-loot",
        "title": "Non-Adjacent Loot",
        "difficulty": "medium",
        "points": 30,
        "topic_tags": ["Array", "Dynamic Programming"],
        "company_tags": ["Amazon", "Airbnb"],
        "description_md": """You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and **it will automatically contact the police if two adjacent houses were broken into on the same night**.

Given an integer array `values` representing the amount of money of each house, return *the maximum amount of money you can rob tonight without alerting the police*.

### Example 1:
```text
Input: values = [1,2,3,1]
Output: 4
Explanation: Rob house 1 (money = 1) and then rob house 3 (money = 3). Total amount you can rob = 1 + 3 = 4.
```

### Example 2:
```text
Input: values = [2,7,9,3,1]
Output: 12
Explanation: Rob house 1 (money = 2), rob house 3 (money = 9) and rob house 5 (money = 1). Total amount = 2 + 9 + 1 = 12.
```
""",
        "constraints_md": """- $1 \\le \\text{values.length} \\le 100$
- $0 \\le \\text{values}[i] \\le 400$
""",
        "editorial_md": """### Approach: Dynamic Programming (Two Variables)

Classic two-variable DP: track the best total ending at the previous unit (`prev`) and two units back (`prev2`). At each unit, the best total is `max(prev, prev2 + values[i])`.

#### Complexity:
- **Time Complexity:** $O(n)$
- **Space Complexity:** $O(1)$
""",
        "hints": [
            "For each unit, you have two choices: rob it (and add to max loot from 2 units ago) or skip it (and keep max loot from previous unit).",
            "Reduce the DP state to two variables."
        ],
        "test_cases": [
            {"input_json": "[[1,2,3,1]]", "expected_output_json": "4", "is_sample": True, "order_matters": True},
            {"input_json": "[[2,7,9,3,1]]", "expected_output_json": "12", "is_sample": True, "order_matters": True},
            {"input_json": "[[5]]", "expected_output_json": "5", "is_sample": False, "order_matters": True},
            {"input_json": "[[2,1,1,2]]", "expected_output_json": "4", "is_sample": False, "order_matters": True},
            {"input_json": "[[200]]", "expected_output_json": "200", "is_sample": False, "order_matters": True}
        ],
        "python_starter": "from typing import List\n\ndef solve(values: List[int]) -> int:\n    # your code here\n    return 0\n",
        "js_starter": "function solve(values) {\n    // your code here\n    return 0;\n}\n",
        "cpp_starter": "#include <vector>\nusing namespace std;\n\nint solve(vector<int>& values) {\n    // your code here\n    return 0;\n}\n",
        "java_starter": "class Solution {\n    public int solve(int[] values) {\n        // your code here\n        return 0;\n    }\n}\n"
    },

    # 10. Merged Median
    {
        "slug": "merged-median",
        "title": "Merged Median",
        "difficulty": "hard",
        "points": 50,
        "topic_tags": ["Array", "Binary Search"],
        "company_tags": ["Google", "Microsoft"],
        "description_md": """Given two sorted arrays `serverA` and `serverB` of size `m` and `n` respectively, return **the median** of the two sorted arrays.

The overall run time complexity should be $O(\\log(m+n))$.

### Example 1:
```text
Input: serverA = [1,3], serverB = [2]
Output: 2.0
Explanation: Merged array = [1,2,3] and median is 2.
```

### Example 2:
```text
Input: serverA = [1,2], serverB = [3,4]
Output: 2.5
Explanation: Merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.
```
""",
        "constraints_md": """- $0 \\le m, n \\le 1000$ where $m = \\text{serverA.length}, n = \\text{serverB.length}$
- $1 \\le m + n \\le 2000$
- $-10^6 \\le \\text{serverA}[i], \\text{serverB}[i] \\le 10^6$
""",
        "editorial_md": """### Approach: Binary Search on Partition

Binary search on the partition point of the *smaller* array. For a candidate partition, compute the matching partition of the other array such that the combined left half and right half have equal (or near-equal) size, then check whether every left-side element is $\\le$ every right-side element. Adjust the search range until that boundary condition holds; the median comes directly from the boundary elements.

#### Complexity:
- **Time Complexity:** $O(\\log(\\min(m, n)))$
- **Space Complexity:** $O(1)$
""",
        "hints": [
            "Always perform binary search on the shorter array to ensure logarithmic time.",
            "Partition both arrays such that left half and right half contain equal number of elements and all elements on left <= all elements on right."
        ],
        "test_cases": [
            {"input_json": "[[1,3],[2]]", "expected_output_json": "2.0", "is_sample": True, "order_matters": True},
            {"input_json": "[[1,2],[3,4]]", "expected_output_json": "2.5", "is_sample": True, "order_matters": True},
            {"input_json": "[[],[1]]", "expected_output_json": "1.0", "is_sample": False, "order_matters": True},
            {"input_json": "[[2],[]]", "expected_output_json": "2.0", "is_sample": False, "order_matters": True},
            {"input_json": "[[],[1,2,3,4,5]]", "expected_output_json": "3.0", "is_sample": False, "order_matters": True},
            {"input_json": "[[-10,-2,0],[3,5,8,9,100]]", "expected_output_json": "4.0", "is_sample": False, "order_matters": True}
        ],
        "python_starter": "from typing import List\n\ndef solve(serverA: List[int], serverB: List[int]) -> float:\n    # your code here\n    return 0.0\n",
        "js_starter": "function solve(serverA, serverB) {\n    // your code here\n    return 0.0;\n}\n",
        "cpp_starter": "#include <vector>\nusing namespace std;\n\ndouble solve(vector<int>& serverA, vector<int>& serverB) {\n    // your code here\n    return 0.0;\n}\n",
        "java_starter": "class Solution {\n    public double solve(int[] serverA, int[] serverB) {\n        // your code here\n        return 0.0;\n    }\n}\n"
    }
]

ACHIEVEMENTS = [
    {"code": "first_blood", "title": "First Solve", "description": "Solved your very first algorithm problem in Code Arena.", "icon_key": "sword"},
    {"code": "streak_3", "title": "Consistency Starter", "description": "Achieved an active practice streak of 3 consecutive days.", "icon_key": "flame"},
    {"code": "streak_7", "title": "Weekly Champion", "description": "Achieved an active practice streak of 7 consecutive days.", "icon_key": "calendar"},
    {"code": "streak_30", "title": "Iron Discipline", "description": "Maintained a 30-day coding streak on the platform.", "icon_key": "zap"},
    {"code": "easy_master", "title": "Foundations Master", "description": "Solved 25 Easy difficulty challenges.", "icon_key": "shield"},
    {"code": "medium_master", "title": "Interview Ready", "description": "Solved 30 Medium difficulty algorithmic problems.", "icon_key": "target"},
    {"code": "hard_master", "title": "Grandmaster", "description": "Solved 10 Hard algorithmic challenges.", "icon_key": "trophy"},
    {"code": "polyglot", "title": "Polyglot Engineer", "description": "Submitted accepted solutions in Python, JS, C++, and Java.", "icon_key": "globe"},
]

def seed_database(db: Session):
    # 1. Seed Achievements
    for ach_data in ACHIEVEMENTS:
        exists = db.query(Achievement).filter(Achievement.code == ach_data["code"]).first()
        if not exists:
            ach = Achievement(
                code=ach_data["code"],
                title=ach_data["title"],
                description=ach_data["description"],
                icon_key=ach_data["icon_key"]
            )
            db.add(ach)
    db.commit()

    # 2. Seed Clean Demo Users (0 submissions, fresh start)
    demo_student = db.query(User).filter((User.username == "demo_student") | (User.email == "demo_student@codearena.dev")).first()
    if not demo_student:
        demo_student = User(
            username="demo_student",
            email="demo_student@codearena.dev",
            password_hash=get_password_hash("password123"),
            role="user",
            bio="CS Student preparing for Technical Interviews.",
            is_demo=True
        )
        db.add(demo_student)

    demo_admin = db.query(User).filter((User.username == "demo_admin") | (User.email == "demo_admin@codearena.dev")).first()
    if not demo_admin:
        demo_admin = User(
            username="demo_admin",
            email="demo_admin@codearena.dev",
            password_hash=get_password_hash("password123"),
            role="admin",
            bio="Staff Engineer & Content Lead at Code Arena.",
            is_demo=True
        )
        db.add(demo_admin)
    db.commit()
    db.refresh(demo_student)
    db.refresh(demo_admin)

    # 3. Seed Exact 10 Problems & Configurations & Synchronize Test Cases
    created_problems = []
    for pdata in SAMPLE_PROBLEMS:
        prob = db.query(Problem).filter(Problem.slug == pdata["slug"]).first()
        if not prob:
            prob = Problem(
                slug=pdata["slug"],
                title=pdata["title"],
                difficulty=pdata["difficulty"],
                points=pdata["points"],
                topic_tags=pdata["topic_tags"],
                company_tags=pdata["company_tags"],
                description_md=pdata["description_md"],
                constraints_md=pdata.get("constraints_md"),
                editorial_md=pdata.get("editorial_md"),
                status="published",
                created_by=demo_admin.id
            )
            db.add(prob)
            db.commit()
            db.refresh(prob)

            # Language configs for all 4 supported languages (Clean stubs)
            py_config = ProblemLanguageConfig(
                problem_id=prob.id,
                language="python",
                starter_code=pdata.get("python_starter", DEFAULT_LANGUAGE_CONFIGS["python"]["starter_code"]),
                wrapper_template=DEFAULT_LANGUAGE_CONFIGS["python"]["wrapper_template"]
            )
            js_config = ProblemLanguageConfig(
                problem_id=prob.id,
                language="javascript",
                starter_code=pdata.get("js_starter", DEFAULT_LANGUAGE_CONFIGS["javascript"]["starter_code"]),
                wrapper_template=DEFAULT_LANGUAGE_CONFIGS["javascript"]["wrapper_template"]
            )
            cpp_config = ProblemLanguageConfig(
                problem_id=prob.id,
                language="cpp",
                starter_code=pdata.get("cpp_starter", DEFAULT_LANGUAGE_CONFIGS["cpp"]["starter_code"]),
                wrapper_template=get_cpp_wrapper(pdata["slug"])
            )
            java_config = ProblemLanguageConfig(
                problem_id=prob.id,
                language="java",
                starter_code=pdata.get("java_starter", DEFAULT_LANGUAGE_CONFIGS["java"]["starter_code"]),
                wrapper_template=get_java_wrapper(pdata["slug"])
            )
            db.add(py_config)
            db.add(js_config)
            db.add(cpp_config)
            db.add(java_config)

            # Hints
            for i, h in enumerate(pdata["hints"]):
                db.add(Hint(problem_id=prob.id, content_md=h, display_order=i))

        # Always synchronize test cases to include newly added hidden/sample test cases
        db.query(TestCase).filter(TestCase.problem_id == prob.id).delete()
        for i, tc in enumerate(pdata["test_cases"]):
            db.add(TestCase(
                problem_id=prob.id,
                input_json=tc["input_json"],
                expected_output_json=tc["expected_output_json"],
                is_sample=tc.get("is_sample", False),
                order_matters=tc.get("order_matters", True),
                display_order=i
            ))
        db.commit()
        created_problems.append(prob)

    # 4. Seed Sheets
    sheets_data = [
        {
            "slug": "google-interview-sheet",
            "name": "Google Top Questions",
            "description": "Curated problems frequently appearing in Google technical phone screens and on-sites.",
            "problem_slugs": ["signal-pair", "best-continuous-streak", "repeat-detector", "letter-match", "island-counter", "merged-median"]
        },
        {
            "slug": "amazon-top-50",
            "name": "Amazon Most Asked",
            "description": "High frequency questions asked in Amazon SDE-1 and SDE-2 loops.",
            "problem_slugs": ["signal-pair", "best-trade-window", "everyone-except-me", "triple-balance", "island-counter", "non-adjacent-loot"]
        },
        {
            "slug": "top-150-interview",
            "name": "Top Interview Practice",
            "description": "Core algorithm patterns covering arrays, prefix sums, binary search, graphs, and dynamic programming.",
            "problem_slugs": ["signal-pair", "best-trade-window", "everyone-except-me", "best-continuous-streak", "repeat-detector", "triple-balance", "letter-match", "island-counter", "non-adjacent-loot", "merged-median"]
        }
    ]

    for s_item in sheets_data:
        sheet = db.query(Sheet).filter(Sheet.slug == s_item["slug"]).first()
        if not sheet:
            sheet = Sheet(
                slug=s_item["slug"],
                name=s_item["name"],
                description=s_item["description"]
            )
            db.add(sheet)
            db.commit()
            db.refresh(sheet)

            for order, p_slug in enumerate(s_item["problem_slugs"]):
                prob = db.query(Problem).filter(Problem.slug == p_slug).first()
                if prob:
                    db.add(SheetProblem(sheet_id=sheet.id, problem_id=prob.id, display_order=order))
            db.commit()

    # 5. Seed Daily Challenge (Points to Signal Pair)
    today = date.today()
    dc = db.query(DailyChallenge).filter(DailyChallenge.challenge_date == today).first()
    if not dc and created_problems:
        first_prob = created_problems[0]
        db.add(DailyChallenge(
            problem_id=first_prob.id,
            challenge_date=today
        ))
        db.commit()
