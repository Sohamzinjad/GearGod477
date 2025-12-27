from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.database import get_db
from app.models import Team, User
from app.schemas import Team as TeamSchema, TeamCreate, UserResponse

router = APIRouter(prefix="/teams", tags=["teams"])

@router.post("/", response_model=TeamSchema)
async def create_team(team: TeamCreate, db: AsyncSession = Depends(get_db)):
    db_team = Team(name=team.name)
    db.add(db_team)
    await db.commit()
    await db.refresh(db_team)
    return db_team

@router.get("/", response_model=List[TeamSchema])
async def read_teams(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Team).offset(skip).limit(limit))
    return result.scalars().all()

@router.post("/{team_id}/assign/{user_id}", response_model=UserResponse)
async def assign_user_to_team(team_id: int, user_id: int, db: AsyncSession = Depends(get_db)):
    # Check Team
    team_res = await db.execute(select(Team).where(Team.id == team_id))
    team = team_res.scalars().first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    # Check User
    user_res = await db.execute(select(User).where(User.id == user_id))
    user = user_res.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.team_id = team_id
    await db.commit()
    await db.refresh(user)
    return user
