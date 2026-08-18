def test_list_problems(client):
    res = client.get("/api/problems")
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert len(data["items"]) > 0
    assert data["total"] > 0

def test_problem_filter_difficulty(client):
    res = client.get("/api/problems?difficulty=easy")
    assert res.status_code == 200
    items = res.json()["items"]
    for item in items:
        assert item["difficulty"] == "easy"

def test_get_problem_by_slug(client):
    res = client.get("/api/problems/signal-pair")
    assert res.status_code == 200
    data = res.json()
    assert data["slug"] == "signal-pair"
    assert data["title"] == "Signal Pair"
    assert len(data["sample_test_cases"]) > 0

def test_similar_problems(client):
    res = client.get("/api/problems/signal-pair/similar")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_random_problem(client):
    res = client.get("/api/problems/random")
    assert res.status_code == 200
    assert "slug" in res.json()
