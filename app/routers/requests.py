from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional

from app.database import get_db
from app.models import MaintenanceRequest, Equipment, RequestStage, EquipmentStatus, MaintenanceFor
from app.schemas import MaintenanceRequest as MaintenanceRequestSchema, MaintenanceRequestCreate, MaintenanceRequestUpdate

router = APIRouter()

@router.post("/requests/", response_model=MaintenanceRequestSchema)
async def create_request(request: MaintenanceRequestCreate, db: AsyncSession = Depends(get_db)):
    # Auto-fill Logic
    if request.maintenance_for == MaintenanceFor.EQUIPMENT and request.equipment_id:
        result = await db.execute(select(Equipment).filter(Equipment.id == request.equipment_id))
        equipment = result.scalar_one_or_none()
        if not equipment:
             raise HTTPException(status_code=404, detail="Equipment not found")
        
        # Auto-fill missing fields from Equipment
        if not request.category_id:
            request.category_id = equipment.category_id
        if not request.team_id:
            request.team_id = equipment.team_id
        if not request.technician_id:
             request.technician_id = equipment.default_technician_id
        
        # Auto-fill WorkCenter if Equipment is linked
        if not request.work_center_id and equipment.work_center_id:
            request.work_center_id = equipment.work_center_id
            
    elif request.maintenance_for == MaintenanceFor.WORK_CENTER and not request.work_center_id:
        raise HTTPException(status_code=400, detail="Work Center ID required for Work Center maintenance")

    db_request = MaintenanceRequest(**request.model_dump())
    db.add(db_request)
    await db.commit()
    await db.refresh(db_request)
    return db_request

@router.get("/requests/", response_model=List[MaintenanceRequestSchema])
async def read_requests(
    skip: int = 0, 
    limit: int = 100, 
    stage: Optional[RequestStage] = None,
    equipment_id: Optional[int] = None,
    work_center_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy.orm import selectinload
    
    query = select(MaintenanceRequest).options(
        selectinload(MaintenanceRequest.category),
        selectinload(MaintenanceRequest.team)
    )
    if stage:
        query = query.filter(MaintenanceRequest.stage == stage)
    if equipment_id:
        query = query.filter(MaintenanceRequest.equipment_id == equipment_id)
    if work_center_id:
        query = query.filter(MaintenanceRequest.work_center_id == work_center_id)
        
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/requests/{request_id}", response_model=MaintenanceRequestSchema)
async def read_request(request_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MaintenanceRequest).filter(MaintenanceRequest.id == request_id))
    db_request = result.scalar_one_or_none()
    if db_request is None:
        raise HTTPException(status_code=404, detail="Request not found")
    return db_request

@router.put("/requests/{request_id}", response_model=MaintenanceRequestSchema)
async def update_request(request_id: int, request_update: MaintenanceRequestUpdate, db: AsyncSession = Depends(get_db)):
    # Fetch existing
    result = await db.execute(select(MaintenanceRequest).filter(MaintenanceRequest.id == request_id))
    db_request = result.scalar_one_or_none()
    if db_request is None:
        raise HTTPException(status_code=404, detail="Request not found")

    # Update logic
    update_data = request_update.model_dump(exclude_unset=True)
    
    # Check for Scrap transition
    # Sync Equipment Status with Stage
    new_stage = update_data.get("stage")
    if new_stage and new_stage != db_request.stage:
        if db_request.maintenance_for == MaintenanceFor.EQUIPMENT and db_request.equipment_id:
            equipment_result = await db.execute(select(Equipment).filter(Equipment.id == db_request.equipment_id))
            equipment = equipment_result.scalar_one_or_none()
            
            if equipment:
                if new_stage == RequestStage.IN_PROGRESS:
                    equipment.status = EquipmentStatus.MAINTENANCE.value
                elif new_stage == RequestStage.REPAIRED:
                    equipment.status = EquipmentStatus.ACTIVE.value
                elif new_stage == RequestStage.SCRAP:
                    equipment.status = EquipmentStatus.DECOMMISSIONED.value
                    equipment.scrap_date = db_request.request_date # Set scrap date
                
                db.add(equipment)

    # Apply updates
    for key, value in update_data.items():
        setattr(db_request, key, value)
    
    db.add(db_request)
    await db.commit()
    await db.refresh(db_request)
    return db_request

@router.delete("/requests/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_request(request_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MaintenanceRequest).filter(MaintenanceRequest.id == request_id))
    db_request = result.scalar_one_or_none()
    if db_request is None:
        raise HTTPException(status_code=404, detail="Request not found")
    
    await db.delete(db_request)
    await db.commit()
    return None
