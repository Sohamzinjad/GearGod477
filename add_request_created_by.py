import asyncio
from app.database import engine, Base
from sqlalchemy import text

async def add_column():
    async with engine.begin() as conn:
        print("Adding created_by_id column to maintenance_requests...")
        try:
             await conn.execute(text("ALTER TABLE maintenance_requests ADD COLUMN created_by_id INTEGER REFERENCES users(id)"))
             print("Column added successfully.")
        except Exception as e:
            print(f"Error adding column: {e}")
            # Likely already exists or table doesn't exist
            pass

if __name__ == "__main__":
    asyncio.run(add_column())
