from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional

from app.database import get_db
from app.models import MaintenanceRequest, Equipment, RequestStage, EquipmentStatus, MaintenanceFor
from app.schemas import MaintenanceRequest as MaintenanceRequestSchema, MaintenanceRequestCreate, MaintenanceRequestUpdate

router = APIRouter()

from app.auth_utils import get_current_user
from app.models import User

@router.post("/requests/", response_model=MaintenanceRequestSchema)
async def create_request(
    request: MaintenanceRequestCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
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
    db_request.created_by_id = current_user.id
    db.add(db_request)
    await db.commit()
    
    # Re-fetch with relationships loaded
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(MaintenanceRequest)
        .options(
            selectinload(MaintenanceRequest.category), 
            selectinload(MaintenanceRequest.team),
            selectinload(MaintenanceRequest.equipment)
        )
        .filter(MaintenanceRequest.id == db_request.id)
    )
    return result.scalar_one()

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
        selectinload(MaintenanceRequest.team),
        selectinload(MaintenanceRequest.equipment)
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
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(MaintenanceRequest)
        .options(
            selectinload(MaintenanceRequest.category), 
            selectinload(MaintenanceRequest.team),
            selectinload(MaintenanceRequest.equipment)
        )
        .filter(MaintenanceRequest.id == request_id)
    )
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
    
    # Re-fetch with relationships loaded
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(MaintenanceRequest)
        .options(
            selectinload(MaintenanceRequest.category), 
            selectinload(MaintenanceRequest.team),
            selectinload(MaintenanceRequest.equipment)
        )
        .filter(MaintenanceRequest.id == request_id)
    )
    return result.scalar_one()

    await db.delete(db_request)
    await db.commit()
    return None

@router.get("/requests/{request_id}/worksheet")
async def download_worksheet(request_id: int, db: AsyncSession = Depends(get_db)):
    from fastapi.responses import StreamingResponse
    import io
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    
    # Fetch Request
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(MaintenanceRequest)
        .options(
            selectinload(MaintenanceRequest.category), 
            selectinload(MaintenanceRequest.team),
            selectinload(MaintenanceRequest.equipment)
        )
        .filter(MaintenanceRequest.id == request_id)
    )
    request = result.scalar_one_or_none()
    
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
        
    # Generate PDF
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    
    # Title
    c.setFont("Helvetica-Bold", 18)
    c.drawString(50, 750, f"Maintenance Worksheet #{request.id}")
    
    # Details
    c.setFont("Helvetica", 12)
    y = 700
    line_height = 20
    
    c.drawString(50, y, f"Subject: {request.subject}")
    y -= line_height
    c.drawString(50, y, f"Date: {request.request_date}")
    y -= line_height
    c.drawString(50, y, f"Priority: {request.priority}")
    y -= line_height
    c.drawString(50, y, f"Stage: {request.stage}")
    y -= line_height * 2 # Space
    
    # Target
    if request.maintenance_for == "Equipment":
         c.drawString(50, y, f"Equipment ID: {request.equipment_id}")
    else:
         c.drawString(50, y, f"Work Center ID: {request.work_center_id}")
    y -= line_height
    
    c.drawString(50, y, f"Category: {request.category.name if request.category else '-'}")
    y -= line_height * 2
    
    # Description
    c.drawString(50, y, "Description:")
    y -= line_height
    
    desc = request.description or "No description provided."
    # Simple word wrap simulation (very basic)
    words = desc.split()
    line = ""
    for word in words:
        if len(line + word) > 80:
             c.drawString(70, y, line)
             line = word + " "
             y -= line_height
        else:
             line += word + " "
    c.drawString(70, y, line)
    
    # Footer
    c.save()
    buffer.seek(0)
    
    headers = {
        'Content-Disposition': f'attachment; filename="Worksheet_{request.id}.pdf"'
    }
    return StreamingResponse(buffer, media_type='application/pdf', headers=headers)
