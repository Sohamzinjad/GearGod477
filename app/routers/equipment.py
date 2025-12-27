from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List

from app.database import get_db
from app.models import Equipment, MaintenanceRequest, RequestStage
from app.schemas import Equipment as EquipmentSchema, EquipmentCreate, EquipmentCount

router = APIRouter()

@router.post("/equipments/", response_model=EquipmentSchema)
async def create_equipment(equipment: EquipmentCreate, db: AsyncSession = Depends(get_db)):
    db_equipment = Equipment(**equipment.model_dump())
    db.add(db_equipment)
    await db.commit()
    await db.refresh(db_equipment)
    return db_equipment

@router.get("/equipments/", response_model=List[EquipmentSchema])
async def read_equipments(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Equipment).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/equipments/{equipment_id}", response_model=EquipmentSchema)
async def read_equipment(equipment_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Equipment).filter(Equipment.id == equipment_id))
    db_equipment = result.scalar_one_or_none()
    if db_equipment is None:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return db_equipment

@router.put("/equipments/{equipment_id}", response_model=EquipmentSchema)
async def update_equipment(equipment_id: int, equipment_update: EquipmentCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Equipment).filter(Equipment.id == equipment_id))
    db_equipment = result.scalar_one_or_none()
    if db_equipment is None:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    update_data = equipment_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_equipment, key, value)
    
    db.add(db_equipment)
    await db.commit()
    await db.refresh(db_equipment)
    return db_equipment

@router.delete("/equipments/{equipment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_equipment(equipment_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Equipment).filter(Equipment.id == equipment_id))
    db_equipment = result.scalar_one_or_none()
    if db_equipment is None:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    await db.delete(db_equipment)
    await db.commit()
    return None

# Smart Button Logic
@router.get("/equipments/{equipment_id}/maintenance-count", response_model=EquipmentCount)
async def get_maintenance_count(equipment_id: int, db: AsyncSession = Depends(get_db)):
    # Verify equipment exists
    result = await db.execute(select(Equipment).filter(Equipment.id == equipment_id))
    if not result.scalar_one_or_none():
         raise HTTPException(status_code=404, detail="Equipment not found")

    # Count all requests
    total_query = select(func.count(MaintenanceRequest.id)).filter(MaintenanceRequest.equipment_id == equipment_id)
    total_result = await db.execute(total_query)
    total = total_result.scalar() or 0

    # Count active requests
    active_query = select(func.count(MaintenanceRequest.id)).filter(
        MaintenanceRequest.equipment_id == equipment_id,
        MaintenanceRequest.stage.in_([RequestStage.NEW_REQUEST, RequestStage.IN_PROGRESS])
    )
    active_result = await db.execute(active_query)
    active = active_result.scalar() or 0

    return EquipmentCount(total=total, maintenance_active=active)
