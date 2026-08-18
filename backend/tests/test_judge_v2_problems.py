import pytest
from app.judge.docker_runner import runner
from app.judge.normalizer import compare_outputs
from app.services.seed_demo_data import SAMPLE_PROBLEMS

REFERENCE_SOLUTIONS = {
    "signal-pair": """
from typing import List

def solve(readings: List[int], target: int) -> List[int]:
    seen = {}
    for i, r in enumerate(readings):
        diff = target - r
        if diff in seen:
            return [seen[diff], i]
        seen[r] = i
    return []
""",
    "best-trade-window": """
from typing import List

def solve(prices: List[int]) -> int:
    min_p = float('inf')
    max_prof = 0
    for p in prices:
        if p < min_p:
            min_p = p
        elif p - min_p > max_prof:
            max_prof = p - min_p
    return max_prof
""",
    "everyone-except-me": """
from typing import List

def solve(multipliers: List[int]) -> List[int]:
    n = len(multipliers)
    res = [1] * n
    prefix = 1
    for i in range(n):
        res[i] = prefix
        prefix *= multipliers[i]
    suffix = 1
    for i in range(n - 1, -1, -1):
        res[i] *= suffix
        suffix *= multipliers[i]
    return res
""",
    "best-continuous-streak": """
from typing import List

def solve(deltas: List[int]) -> int:
    cur_sum = deltas[0]
    max_sum = deltas[0]
    for x in deltas[1:]:
        cur_sum = max(x, cur_sum + x)
        max_sum = max(max_sum, cur_sum)
    return max_sum
""",
    "repeat-detector": """
from typing import List

def solve(ids: List[int]) -> bool:
    return len(ids) != len(set(ids))
""",
    "triple-balance": """
from typing import List

def solve(amounts: List[int]) -> List[List[int]]:
    amounts.sort()
    res = []
    n = len(amounts)
    for i in range(n - 2):
        if i > 0 and amounts[i] == amounts[i - 1]:
            continue
        l, r = i + 1, n - 1
        while l < r:
            s = amounts[i] + amounts[l] + amounts[r]
            if s == 0:
                res.append([amounts[i], amounts[l], amounts[r]])
                while l < r and amounts[l] == amounts[l + 1]:
                    l += 1
                while l < r and amounts[r] == amounts[r - 1]:
                    r -= 1
                l += 1
                r -= 1
            elif s < 0:
                l += 1
            else:
                r -= 1
    return res
""",
    "letter-match": """
def solve(a: str, b: str) -> bool:
    if len(a) != len(b):
        return False
    counts = [0] * 26
    for char in a:
        counts[ord(char) - ord('a')] += 1
    for char in b:
        idx = ord(char) - ord('a')
        counts[idx] -= 1
        if counts[idx] < 0:
            return False
    return True
""",
    "island-counter": """
from typing import List

def solve(grid: List[List[str]]) -> int:
    if not grid or not grid[0]:
        return 0
    rows, cols = len(grid), len(grid[0])
    count = 0
    def dfs(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != '1':
            return
        grid[r][c] = '0'
        dfs(r + 1, c)
        dfs(r - 1, c)
        dfs(r, c + 1)
        dfs(r, c - 1)
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                count += 1
                dfs(r, c)
    return count
""",
    "non-adjacent-loot": """
from typing import List

def solve(values: List[int]) -> int:
    if not values:
        return 0
    prev1, prev2 = 0, 0
    for v in values:
        prev1, prev2 = max(prev1, prev2 + v), prev1
    return prev1
""",
    "merged-median": """
from typing import List

def solve(serverA: List[int], serverB: List[int]) -> float:
    if len(serverA) > len(serverB):
        serverA, serverB = serverB, serverA
    m, n = len(serverA), len(serverB)
    low, high = 0, m
    while low <= high:
        pA = (low + high) // 2
        pB = (m + n + 1) // 2 - pA
        maxLeftA = float('-inf') if pA == 0 else serverA[pA - 1]
        minRightA = float('inf') if pA == m else serverA[pA]
        maxLeftB = float('-inf') if pB == 0 else serverB[pB - 1]
        minRightB = float('inf') if pB == n else serverB[pB]
        if maxLeftA <= minRightB and maxLeftB <= minRightA:
            if (m + n) % 2 == 0:
                return (max(maxLeftA, maxLeftB) + min(minRightA, minRightB)) / 2.0
            else:
                return float(max(maxLeftA, maxLeftB))
        elif maxLeftA > minRightB:
            high = pA - 1
        else:
            low = pA + 1
    return 0.0
"""
}

V2_PROBLEMS = list(REFERENCE_SOLUTIONS.keys())

@pytest.mark.parametrize("slug", V2_PROBLEMS)
def test_v2_problem_reference_solutions(slug: str):
    prob_data = next((p for p in SAMPLE_PROBLEMS if p["slug"] == slug), None)
    assert prob_data is not None, f"Problem {slug} not found in SAMPLE_PROBLEMS"

    python_solution = REFERENCE_SOLUTIONS[slug]
    test_cases = prob_data["test_cases"]

    res = runner.execute_test_cases(
        language="python",
        user_code=python_solution,
        wrapper_template=None,
        test_cases=test_cases,
        time_limit_ms=2000,
        memory_limit_mb=256,
        is_run_only=False
    )

    assert res["status"] == "accepted", f"Failed for {slug}: status={res['status']}, err={res.get('error_message')}"
    assert res["passed_test_cases"] == len(test_cases), f"Only {res['passed_test_cases']}/{len(test_cases)} passed for {slug}"

def test_everyone_except_me_order_matters_strictness():
    prob_data = next(p for p in SAMPLE_PROBLEMS if p["slug"] == "everyone-except-me")
    test_cases = prob_data["test_cases"]

    scrambled_code = """
from typing import List

def solve(multipliers: List[int]) -> List[int]:
    n = len(multipliers)
    res = [1] * n
    prefix = 1
    for i in range(n):
        res[i] = prefix
        prefix *= multipliers[i]
    suffix = 1
    for i in range(n - 1, -1, -1):
        res[i] *= suffix
        suffix *= multipliers[i]
    return res[::-1]
"""

    res = runner.execute_test_cases(
        language="python",
        user_code=scrambled_code,
        wrapper_template=None,
        test_cases=test_cases,
        time_limit_ms=2000,
        memory_limit_mb=256,
        is_run_only=False
    )

    assert res["status"] == "wrong_answer", "Scrambled order MUST fail because order_matters is True"

def test_merged_median_float_epsilon():
    assert compare_outputs("2.5000001", "2.5", order_matters=True) is True
    assert compare_outputs("2.5000000", "2.5", order_matters=True) is True
    assert compare_outputs("1.0", "1.000000001", order_matters=True) is True
    assert compare_outputs("2.51", "2.5", order_matters=True) is False
