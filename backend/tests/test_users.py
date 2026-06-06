import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_profile_creates_user(client: AsyncClient):
    response = await client.get("/api/v1/users/me")
    assert response.status_code == 200
    profile = response.json()
    assert profile["external_id"] == "dev-user-001"
    assert profile["daily_goal_minutes"] == 10


@pytest.mark.asyncio
async def test_update_profile(client: AsyncClient):
    await client.get("/api/v1/users/me")

    response = await client.patch(
        "/api/v1/users/me",
        json={
            "display_name": "Test User",
            "daily_goal_minutes": 15,
            "preferred_pattern": "4-7-8",
        },
    )
    assert response.status_code == 200
    profile = response.json()
    assert profile["display_name"] == "Test User"
    assert profile["daily_goal_minutes"] == 15
    assert profile["preferred_pattern"] == "4-7-8"
