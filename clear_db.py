import asyncio
import asyncpg
import os

# Database URL from .env
DATABASE_URL = "postgresql://neondb_owner:npg_S9Hjw7AuVIeo@ep-morning-brook-a1un6zo1-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

async def clear_data():
    print(f"Connecting to DB...")
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        print("Connected.")
        
        tables = [
            "maintenance_requests",
            "equipments",
            "users",
            "teams",
            "workcenters",
            "categories"
        ]
        
        print("Clearing data from tables...")
        # TRUNCATE with CASCADE handles foreign keys efficiently
        await conn.execute(f"TRUNCATE TABLE {', '.join(tables)} CASCADE;")
        print("All data cleared successfully.")
            
        await conn.close()
    except Exception as e:
        print(f"Failed to clear data: {e}")

if __name__ == "__main__":
    asyncio.run(clear_data())
