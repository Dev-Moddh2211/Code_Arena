from app.judge.normalizer import compare_outputs, deep_sort
from app.judge.scoring import calculate_submission_score
from app.judge.docker_runner import runner

def test_normalizer_exact():
    assert compare_outputs("[0, 1]", "[0, 1]", order_matters=True) is True
    assert compare_outputs("[0, 1]", "[1, 0]", order_matters=True) is False

def test_normalizer_order_independent():
    # Anagram groups order independent
    out = '[["bat"], ["nat", "tan"], ["ate", "eat", "tea"]]'
    exp = '[["ate", "eat", "tea"], ["bat"], ["nat", "tan"]]'
    assert compare_outputs(out, exp, order_matters=False) is True

def test_normalizer_float_tolerance():
    assert compare_outputs("2.5000001", "2.5", order_matters=True) is True

def test_scoring():
    score_full = calculate_submission_score("medium", 4, 4, 20)
    assert score_full == 20
    score_partial = calculate_submission_score("medium", 2, 4, 20)
    assert score_partial == 5

def test_runner_python_execution():
    code = "def solve(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in seen:\n            return [seen[diff], i]\n        seen[n] = i\n    return []\n"
    test_cases = [
        {"id": "1", "input_json": "[[2,7,11,15], 9]", "expected_output_json": "[0,1]", "is_sample": True, "order_matters": True}
    ]
    res = runner.execute_test_cases("python", code, None, test_cases, is_run_only=True)
    assert res["status"] == "accepted"
    assert res["passed_test_cases"] == 1
