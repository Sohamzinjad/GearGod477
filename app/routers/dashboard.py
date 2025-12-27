from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from datetime import date

from app.database import get_db
from app.models import MaintenanceRequest, Equipment, RequestStage, MaintenanceType
from app.schemas import DashboardStats

router = APIRouter()

@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    # 1. Critical Equipment: Equipment with Active Corrective Maintenance
    # Query: Count distinct equipment_id from requests where type=Corrective and stage in (New, In Progress)
    critical_query = select(func.count(func.distinct(MaintenanceRequest.equipment_id))).filter(
        MaintenanceRequest.maintenance_type == MaintenanceType.CORRECTIVE,
        MaintenanceRequest.stage.in_([RequestStage.NEW_REQUEST, RequestStage.IN_PROGRESS])
    )
    critical_result = await db.execute(critical_query)
    critical_count = critical_result.scalar() or 0

    # 2. Technician Load: Total active requests (assigned or unassigned)
    load_query = select(func.count(MaintenanceRequest.id)).filter(
        MaintenanceRequest.stage.in_([RequestStage.NEW_REQUEST, RequestStage.IN_PROGRESS])
    )
    load_result = await db.execute(load_query)
    load_count = load_result.scalar() or 0

    # 3. Open Requests: Total pending (New + In Progress) - which is same as load?
    # Spec says "Open Requests: Count of total pending vs. overdue tickets".
    # lets try to return total pending.
    open_count = load_count

    # 4. Overdue Requests: Scheduled Date < Today AND not Repaired (not Scrap)
    # Actually, if stage is not Repaired or Scrap.
    overdue_query = select(func.count(MaintenanceRequest.id)).filter(
        MaintenanceRequest.scheduled_date < date.today(),
        MaintenanceRequest.stage.notin_([RequestStage.REPAIRED, RequestStage.SCRAP])
    )
    overdue_result = await db.execute(overdue_query)
    overdue_count = overdue_result.scalar() or 0

    return DashboardStats(
        critical_equipment_count=critical_count,
        technician_load=load_count,
        open_requests_count=open_count,
        overdue_requests_count=overdue_count
    )
