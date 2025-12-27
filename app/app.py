from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers import settings, equipment, requests, dashboard, workcenters

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Establish DB connection and create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(settings.router, tags=["Settings"])
app.include_router(workcenters.router, tags=["Work Centers"])
app.include_router(equipment.router, tags=["Equipment"])
app.include_router(requests.router, tags=["Maintenance Requests"])
app.include_router(dashboard.router, tags=["Dashboard"])

@app.get("/")
async def root():
    return {"message": "GearGuard API is running"}
