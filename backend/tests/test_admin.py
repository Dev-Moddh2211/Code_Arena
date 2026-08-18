def test_admin_cms_workflow(client):
    # 1. Login as demo admin
    auth_res = client.post("/api/auth/demo-login", json={"role": "admin"})
    token = auth_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create problem as draft
    create_res = client.post(
        "/api/admin/problems",
        json={
            "title": "Subarray Sum Equals K",
            "description_md": "Given an array of integers nums and an integer k, return total subarrays whose sum equals k.",
            "difficulty": "medium",
            "points": 20,
            "topic_tags": ["Array", "Hash Map"],
            "company_tags": ["Meta"],
            "status": "draft"
        },
        headers=headers
    )
    assert create_res.status_code == 200
    prob_id = create_res.json()["id"]
    assert create_res.json()["status"] == "draft"

    # 3. Add a test case
    tc_res = client.post(
        f"/api/admin/problems/{prob_id}/test-cases",
        json={"input_json": "[[1,1,1], 2]", "expected_output_json": "2", "is_sample": True, "order_matters": True},
        headers=headers
    )
    assert tc_res.status_code == 200

    # 4. Clone problem
    clone_res = client.post(f"/api/admin/problems/{prob_id}/clone", headers=headers)
    assert clone_res.status_code == 200
    clone_id = clone_res.json()["id"]
    assert "Clone" in clone_res.json()["title"]

    # 5. Publish problem
    pub_res = client.put(f"/api/admin/problems/{prob_id}/publish", headers=headers)
    assert pub_res.status_code == 200

    # 6. Check Admin Platform Analytics
    anal_res = client.get("/api/admin/analytics", headers=headers)
    assert anal_res.status_code == 200
    assert anal_res.json()["total_problems"] > 0
