import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_analytics_summary_empty(client: AsyncClient):
    response = await client.get("/api/v1/analytics/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_sessions"] == 0
    assert data["current_streak"] == 0
    assert len(data["weekly_stats"]) == 7
    assert data["hrv_trend"] == []
    assert data["daily_goal"]["goal_minutes"] == 10


@pytest.mark.asyncio
async def test_analytics_after_sessions(client: AsyncClient):
    await client.post(
        "/api/v1/sessions",
        json={
            "pattern_slug": "box",
            "duration_seconds": 300,
            "cycles_completed": 5,
            "hrv_ms": 50.0,
        },
    )

    response = await client.get("/api/v1/analytics/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_sessions"] == 1
    assert data["total_minutes"] == 5.0
    assert data["pattern_breakdown"]["box"] == 1
    assert len(data["hrv_trend"]) == 1
    assert data["daily_goal"]["completed_minutes"] == 5.0
