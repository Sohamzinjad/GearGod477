from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.database import get_db
from app.models import WorkCenter
from app.schemas import WorkCenter as WorkCenterSchema, WorkCenterCreate

router = APIRouter()

@router.post("/workcenters/", response_model=WorkCenterSchema)
async def create_workcenter(workcenter: WorkCenterCreate, db: AsyncSession = Depends(get_db)):
    db_workcenter = WorkCenter(**workcenter.model_dump())
    db.add(db_workcenter)
    await db.commit()
    await db.refresh(db_workcenter)
    return db_workcenter

@router.get("/workcenters/", response_model=List[WorkCenterSchema])
async def read_workcenters(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(WorkCenter).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/workcenters/{workcenter_id}", response_model=WorkCenterSchema)
async def read_workcenter(workcenter_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(WorkCenter).filter(WorkCenter.id == workcenter_id))
    db_workcenter = result.scalar_one_or_none()
    if db_workcenter is None:
        raise HTTPException(status_code=404, detail="WorkCenter not found")
    return db_workcenter

@router.delete("/workcenters/{workcenter_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workcenter(workcenter_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(WorkCenter).filter(WorkCenter.id == workcenter_id))
    db_workcenter = result.scalar_one_or_none()
    if db_workcenter is None:
        raise HTTPException(status_code=404, detail="WorkCenter not found")
    
    await db.delete(db_workcenter)
    await db.commit()
    return None
