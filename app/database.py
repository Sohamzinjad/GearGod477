from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.engine.url import make_url
from app.config import POSTGRES_URL

# Ensure URL uses async driver
url = POSTGRES_URL
if url and url.startswith("postgresql://"):
    url = url.replace("postgresql://", "postgresql+asyncpg://", 1)

connect_args = {}
if url:
    try:
        u = make_url(url)
        # asyncpg doesn't support 'sslmode' in query params, it uses 'ssl' in connect_args
        # We also remove 'channel_binding' as it can cause issues if not handled
        if "sslmode" in u.query:
            if u.query["sslmode"] == "require":
                connect_args["ssl"] = "require"
            
            # Remove unsupported params for asyncpg
            query_params = dict(u.query)
            query_params.pop("sslmode", None)
            query_params.pop("channel_binding", None)
            
            u = u._replace(query=query_params)
            url = u.render_as_string(hide_password=False)
    except Exception as e:
        print(f"Error parsing URL: {e}")
        # Fallback to original if parsing fails, though it might error later
        pass

engine = create_async_engine(url, echo=True, connect_args=connect_args)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
