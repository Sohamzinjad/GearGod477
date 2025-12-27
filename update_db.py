import asyncio
from app.database import engine
from sqlalchemy import text

async def update_equipments_table():
    async with engine.begin() as conn:
        print("Adding purchase_date column...")
        try:
            await conn.execute(text("ALTER TABLE equipments ADD COLUMN purchase_date DATE"))
            print("purchase_date added.")
        except Exception as e:
            print(f"Error adding purchase_date (might already exist): {e}")

        print("Adding warranty_date column...")
        try:
            await conn.execute(text("ALTER TABLE equipments ADD COLUMN warranty_date DATE"))
            print("warranty_date added.")
        except Exception as e:
            print(f"Error adding warranty_date (might already exist): {e}")

if __name__ == "__main__":
    asyncio.run(update_equipments_table())
