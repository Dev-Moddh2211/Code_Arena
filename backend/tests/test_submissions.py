def test_run_and_submit_flow(client):
    # 1. Login as demo student
    auth_res = client.post("/api/auth/demo-login", json={"role": "student"})
    token = auth_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get problem ID for signal-pair
    prob_res = client.get("/api/problems/signal-pair")
    assert prob_res.status_code == 200
    prob_id = prob_res.json()["id"]

    # 3. Run code (sample cases only, not persisted)
    py_code = "from typing import List\n\ndef solve(readings: List[int], target: int) -> List[int]:\n    seen = {}\n    for i, r in enumerate(readings):\n        diff = target - r\n        if diff in seen:\n            return [seen[diff], i]\n        seen[r] = i\n    return []\n"
    run_res = client.post(
        "/api/submissions/run",
        json={"problem_id": prob_id, "language": "python", "code": py_code},
        headers=headers
    )
    assert run_res.status_code == 200
    assert run_res.json()["status"] == "accepted"

    # 4. Submit code (all cases, persisted)
    sub_res = client.post(
        "/api/submissions/submit",
        json={"problem_id": prob_id, "language": "python", "code": py_code},
        headers=headers
    )
    assert sub_res.status_code == 200
    sub_data = sub_res.json()
    assert sub_data["status"] == "accepted"
    assert sub_data["score"] > 0
    assert sub_data["attempt_number"] >= 1
    assert sub_data["code_size_bytes"] > 0
