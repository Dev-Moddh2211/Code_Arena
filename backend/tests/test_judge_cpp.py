import pytest
from app.judge.docker_runner import runner
from app.judge.wrappers import get_cpp_wrapper
from app.services.seed_demo_data import SAMPLE_PROBLEMS

def test_user_cpp_solution_1():
    """
    Test 1 from user request: Hardcoded pair return {1, 2}
    """
    prob_data = next(p for p in SAMPLE_PROBLEMS if p["slug"] == "signal-pair")
    wrapper = get_cpp_wrapper("signal-pair")

    user_code = """
#include <vector>
using namespace std;

vector<int> solve(vector<int>& readings, int target) {
    return {1, 2};
}
"""
    # Run against sample test cases
    sample_cases = [tc for tc in prob_data["test_cases"] if tc["is_sample"]]

    res = runner.execute_test_cases(
        language="cpp",
        user_code=user_code,
        wrapper_template=wrapper,
        test_cases=sample_cases,
        time_limit_ms=2000,
        memory_limit_mb=256,
        is_run_only=True
    )

    assert res["status"] == "accepted", f"Status: {res['status']}, err: {res.get('error_message')}"
    assert len(res["test_results"]) == 2
    # Check that stdout produced valid output and not <no output>
    assert res["test_results"][0]["stdout"] == "[1,2]" or res["test_results"][0]["stdout"] == "[1, 2]"
    assert res["test_results"][0]["actual_output_json"] == "[1,2]"
    assert res["test_results"][0]["passed"] is True

def test_user_cpp_solution_2_hashmap():
    """
    Test 2 from user request: Unordered map algorithm
    """
    prob_data = next(p for p in SAMPLE_PROBLEMS if p["slug"] == "signal-pair")
    wrapper = get_cpp_wrapper("signal-pair")

    user_code = """
#include <vector>
#include <unordered_map>
using namespace std;

vector<int> solve(vector<int>& readings, int target) {
    unordered_map<int,int> seen;

    for(int i=0;i<readings.size();i++) {
        int need=target-readings[i];

        if(seen.count(need))
            return {seen[need],i};

        seen[readings[i]]=i;
    }

    return {};
}
"""
    all_cases = prob_data["test_cases"]

    res = runner.execute_test_cases(
        language="cpp",
        user_code=user_code,
        wrapper_template=wrapper,
        test_cases=all_cases,
        time_limit_ms=2000,
        memory_limit_mb=256,
        is_run_only=False
    )

    assert res["status"] == "accepted", f"Status: {res['status']}, err: {res.get('error_message')}"
    assert res["passed_test_cases"] == len(all_cases)
    assert res["test_results"][0]["stdout"] == "[1,2]" or res["test_results"][0]["stdout"] == "[1, 2]"
    assert res["test_results"][0]["passed"] is True
