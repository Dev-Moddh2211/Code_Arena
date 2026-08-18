def test_dashboard_aggregations(client):
    auth_res = client.post("/api/auth/demo-login", json={"role": "student"})
    token = auth_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/users/me/dashboard", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert "heatmap" in data
    assert len(data["heatmap"]) == 365
    assert data["difficulty_breakdown"]["total_problems"] >= 10
    assert data["difficulty_breakdown"]["total_solved"] == 0
    assert len(data["achievements"]) > 0
