import asyncio
import httpx
from datetime import date, timedelta

BASE_URL = "http://127.0.0.1:8000"

async def verify():

    from app.app import app
    from httpx import AsyncClient, ASGITransport
    from sqlalchemy import text
    from sqlalchemy.pool import NullPool
    from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
    import app.database as db_module

    # Reset engine to use NullPool to avoid asyncpg cache issues during test
    await db_module.engine.dispose()
    db_module.engine = create_async_engine(db_module.url, echo=True, connect_args=db_module.connect_args, poolclass=NullPool)
    db_module.AsyncSessionLocal = async_sessionmaker(bind=db_module.engine, class_=db_module.AsyncSession, expire_on_commit=False, autoflush=False)
    
    engine = db_module.engine # Local ref
    
    # Force generic cleanup
    async with engine.begin() as conn:
        await conn.execute(text("DROP TABLE IF EXISTS maintenance_requests, equipments, teams, categories CASCADE"))
        await conn.execute(text("DROP TYPE IF EXISTS maintenancetype, priority, requeststage, equipmentstatus CASCADE"))
        
        await conn.run_sync(db_module.Base.metadata.create_all)
    
    # await engine.dispose() # Not needed with NullPool effectively

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        print("1. Creating Category...")
        resp = await ac.post("/categories/", json={"name": "Electronics"})
        assert resp.status_code == 200
        cat_id = resp.json()["id"]
        print(f"   Category 'Electronics' created with ID: {cat_id}")

        print("2. Creating Team...")
        resp = await ac.post("/teams/", json={"name": "Maintenance Squad A"})
        assert resp.status_code == 200
        team_id = resp.json()["id"]
        print(f"   Team 'Maintenance Squad A' created with ID: {team_id}")

        print("3. Creating Equipment...")
        eq_data = {
            "name": "Server X1",
            "serial_number": "SN-12345",
            "category_id": cat_id,
            "team_id": team_id,
            "department": "IT",
            "default_technician_id": "Tech-001"
        }
        resp = await ac.post("/equipments/", json=eq_data)
        assert resp.status_code == 200
        eq_id = resp.json()["id"]
        print(f"   Equipment 'Server X1' created with ID: {eq_id}")

        print("4. Creating Maintenance Request (Auto-fill Check)...")
        # Only sending equipment_id, expecting category/team/tech to be filled
        req_data = {
            "subject": "Screen Flicker",
            "equipment_id": eq_id,
            "request_date": str(date.today()),
            "priority": "High"
        }
        resp = await ac.post("/requests/", json=req_data)
        assert resp.status_code == 200
        req = resp.json()
        assert req["category_id"] == cat_id
        assert req["team_id"] == team_id
        assert req["technician_id"] == "Tech-001"
        req_id = req["id"]
        print(f"   Request created with ID: {req_id}. Auto-fill verified.")

        print("5. Checking Smart Button Count...")
        resp = await ac.get(f"/equipments/{eq_id}/maintenance-count")
        assert resp.status_code == 200
        counts = resp.json()
        assert counts["total"] == 1
        assert counts["maintenance_active"] == 1 # New Request is active
        print(f"   Smart Button Counts: {counts}")

        print("6. Testing Scrap Logic...")
        # Update stage to Scrap
        update_data = {"stage": "Scrap"}
        resp = await ac.put(f"/requests/{req_id}", json=update_data)
        assert resp.status_code == 200
        
        # Verify Equipment Status
        resp = await ac.get(f"/equipments/{eq_id}")
        eq = resp.json()
        assert eq["status"] == "Decommissioned"
        print("   Request moved to Scrap. Equipment status updated to 'Decommissioned'. Verified.")

        print("7. Checking Dashboard Stats...")
        # Create another active request to have some data
        # Equipment 2
        resp = await ac.post("/equipments/", json={
            "name": "Monitor Y2", 
            "serial_number": "SN-67890", 
            "category_id": cat_id
        })
        eq2_id = resp.json()["id"]
        
        # Create overdue request
        yesterday = date.today() - timedelta(days=1)
        resp = await ac.post("/requests/", json={
            "subject": "Routine Check",
            "equipment_id": eq2_id,
            "request_date": str(yesterday),
            "scheduled_date": str(yesterday), # Overdue
            "maintenance_type": "Preventive",
            "stage": "New Request"
        })
        
        resp = await ac.get("/dashboard/stats")
        stats = resp.json()
        print(f"   Dashboard Stats: {stats}")
        assert stats["overdue_requests_count"] >= 1
        
        print("\nALL VERIFICATION STEPS PASSED!")

if __name__ == "__main__":
    asyncio.run(verify())
