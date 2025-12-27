import asyncio
from app.database import engine
from sqlalchemy import text

async def clean_db():
    async with engine.begin() as conn:
        print("Cleaning Database...")
        
        # Disable Foreign Key checks temporarily or just delete in order
        # Requests depend on Equipments, so delete Requests first
        print("Deleting all Maintenance Requests...")
        await conn.execute(text("DELETE FROM maintenance_requests"))
        
        print("Deleting all Equipments...")
        await conn.execute(text("DELETE FROM equipments"))
        
        # Optional: Reset ID sequences if needed, but not strictly necessary for functionality
        
        print("Database Cleaned Successfully.")

if __name__ == "__main__":
    asyncio.run(clean_db())
