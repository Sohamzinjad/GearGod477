import asyncio
from app.database import engine
from sqlalchemy import text

async def add_equipment_company():
    async with engine.begin() as conn:
        print("Migrating Equipment Table...")
        try:
            await conn.execute(text("ALTER TABLE equipments ADD COLUMN company_name VARCHAR"))
            print("Added company_name column.")
        except Exception as e:
            print(f"company_name might already exist: {e}")
            
        print("Migration Complete.")

if __name__ == "__main__":
    asyncio.run(add_equipment_company())
