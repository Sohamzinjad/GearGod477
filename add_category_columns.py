import asyncio
from app.database import engine
from sqlalchemy import text

async def add_category_columns():
    async with engine.begin() as conn:
        print("Migrating Categories Table...")
        try:
            await conn.execute(text("ALTER TABLE categories ADD COLUMN responsible_id INTEGER REFERENCES users(id)"))
            print("Added responsible_id column.")
        except Exception as e:
            print(f"responsible_id might already exist: {e}")

        try:
            await conn.execute(text("ALTER TABLE categories ADD COLUMN company_name VARCHAR DEFAULT 'My Company (San Francisco)'"))
            print("Added company_name column.")
        except Exception as e:
            print(f"company_name might already exist: {e}")
            
        print("Migration Complete.")

if __name__ == "__main__":
    asyncio.run(add_category_columns())
