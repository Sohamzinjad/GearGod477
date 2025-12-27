import asyncio
import httpx
from datetime import date
from sqlalchemy import text
from socket import gaierror

# Import from app context for DB reset
from app.database import engine, Base
from app.app import app
from httpx import AsyncClient, ASGITransport
from sqlalchemy.pool import NullPool
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
import app.database as db_module

async def verify():
    # Reset engine to use NullPool to avoid asyncpg cache issues during test
    await db_module.engine.dispose()
    db_module.engine = create_async_engine(db_module.url, echo=True, connect_args=db_module.connect_args, poolclass=NullPool)
    db_module.AsyncSessionLocal = async_sessionmaker(bind=db_module.engine, class_=db_module.AsyncSession, expire_on_commit=False, autoflush=False)
    
    engine = db_module.engine 

    # Force generic cleanup
    async with engine.begin() as conn:
        await conn.execute(text("DROP TABLE IF EXISTS maintenance_requests, equipments, workcenters, teams, categories CASCADE"))
        await conn.execute(text("DROP TYPE IF EXISTS maintenancetype, priority, requeststage, equipmentstatus, maintenancefor CASCADE"))
        
        await conn.run_sync(db_module.Base.metadata.create_all)
    
    # await engine.dispose() 

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        print("1. Creating Work Center...")
        resp = await ac.post("/workcenters/", json={
            "name": "Assembly Line 1",
            "code": "WC-001",
            "capacity": 5.0
        })
        assert resp.status_code == 200
        wc_id = resp.json()["id"]
        print(f"   Work Center created with ID: {wc_id}")

        print("2. Creating Team...")
        resp = await ac.post("/teams/", json={"name": "Maintenance Squad B"})
        team_id = resp.json()["id"]

        print("3. Creating Equipment Linked to Work Center...")
        cat_resp = await ac.post("/categories/", json={"name": "Tools"})
        cat_id = cat_resp.json()["id"]

        eq_resp = await ac.post("/equipments/", json={
            "name": "Drill Press",
            "serial_number": "DP-999",
            "category_id": cat_id,
            "team_id": team_id,
            "work_center_id": wc_id,
            "location": "Sector 7"
        })
        assert eq_resp.status_code == 200
        eq_id = eq_resp.json()["id"]
        print(f"   Equipment created linked to Work Center: {eq_id}")

        print("4. Creating Maintenance Request for Work Center...")
        req_resp = await ac.post("/requests/", json={
            "subject": "Calibration Needed",
            "maintenance_for": "Work Center", # Enum value
            "work_center_id": wc_id,
            "team_id": team_id,
            "category_id": cat_id,
            "request_date": str(date.today())
        })
        assert req_resp.status_code == 200
        req_id = req_resp.json()["id"]
        print(f"   Work Center Request created: {req_id}")

        print("5. Verifying Equipment Auto-fill (Work Center Link)...")
        # Create request for equipment, check if WC is auto-filled
        req_eq_resp = await ac.post("/requests/", json={
            "subject": "Bit Replacement",
            "maintenance_for": "Equipment",
            "equipment_id": eq_id,
            "request_date": str(date.today())
        })
        assert req_eq_resp.status_code == 200
        req_eq = req_eq_resp.json()
        assert req_eq["work_center_id"] == wc_id
        print("   Equipment Request auto-filled Work Center ID correctly.")

        print("\nWORKCENTER VERIFICATION PASSED!")

if __name__ == "__main__":
    asyncio.run(verify())
