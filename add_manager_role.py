import asyncio
from app.database import engine
from sqlalchemy import text

async def add_manager_role():
    async with engine.begin() as conn:
        print("Adding 'Manager' to userrole enum...")
        # Check if 'Manager' already exists in the enum to avoid error
        # PostgreSQL doesn't support IF NOT EXISTS for ADD VALUE directly in older versions easily 
        # but modern PG handles it or we can just try/except.
        # However, for simplicity in this dev script:
        try:
            await conn.execute(text("ALTER TYPE userrole ADD VALUE 'Manager';"))
            print("Successfully added 'Manager' to userrole.")
        except Exception as e:
            print(f"Error (might already exist): {e}")

if __name__ == "__main__":
    asyncio.run(add_manager_role())
