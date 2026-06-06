import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_patterns(client: AsyncClient):
    response = await client.get("/api/v1/sessions/patterns")
    assert response.status_code == 200
    patterns = response.json()
    assert len(patterns) == 3
    slugs = {p["slug"] for p in patterns}
    assert slugs == {"box", "4-7-8", "wim-hof"}


@pytest.mark.asyncio
async def test_create_and_list_sessions(client: AsyncClient):
    create_response = await client.post(
        "/api/v1/sessions",
        json={
            "pattern_slug": "box",
            "duration_seconds": 240,
            "cycles_completed": 4,
            "avg_heart_rate": 72.5,
            "hrv_ms": 45.0,
        },
    )
    assert create_response.status_code == 201
    session = create_response.json()
    assert session["pattern_slug"] == "box"
    assert session["duration_seconds"] == 240

    list_response = await client.get("/api/v1/sessions")
    assert list_response.status_code == 200
    sessions = list_response.json()
    assert len(sessions) >= 1


@pytest.mark.asyncio
async def test_get_and_delete_session(client: AsyncClient):
    create_response = await client.post(
        "/api/v1/sessions",
        json={
            "pattern_slug": "4-7-8",
            "duration_seconds": 180,
            "cycles_completed": 3,
        },
    )
    session_id = create_response.json()["id"]

    get_response = await client.get(f"/api/v1/sessions/{session_id}")
    assert get_response.status_code == 200

    delete_response = await client.delete(f"/api/v1/sessions/{session_id}")
    assert delete_response.status_code == 204

    get_again = await client.get(f"/api/v1/sessions/{session_id}")
    assert get_again.status_code == 404


@pytest.mark.asyncio
async def test_invalid_pattern(client: AsyncClient):
    response = await client.post(
        "/api/v1/sessions",
        json={
            "pattern_slug": "invalid",
            "duration_seconds": 120,
            "cycles_completed": 2,
        },
    )
    assert response.status_code == 422
