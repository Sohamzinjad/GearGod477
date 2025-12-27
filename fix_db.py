import asyncio
from app.database import engine, Base
from app.models import User
from sqlalchemy import text

async def reset_users_table():
    async with engine.begin() as conn:
        # We can't easily drop just one table using metadata.drop_all without targeting.
        # But we can execute raw SQL to be sure.
        print("Dropping users table...")
        await conn.execute(text("DROP TABLE IF EXISTS users CASCADE"))
        print("Users table dropped.")
        
        # We can also drop teams if we want to be super clean, but let's try just users first.
        # Actually, let's let app.py recreate it on startup.
        
if __name__ == "__main__":
    asyncio.run(reset_users_table())
