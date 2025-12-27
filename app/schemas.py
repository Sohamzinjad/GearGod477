from pydantic import BaseModel
from typing import Optional, List
from datetime import date
from app.models import MaintenanceType, Priority, RequestStage, EquipmentStatus, MaintenanceFor

# Category Schemas
class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int

    class Config:
        from_attributes = True

# Team Schemas
class TeamBase(BaseModel):
    name: str

class TeamCreate(TeamBase):
    pass

class Team(TeamBase):
    id: int
    users: List["UserResponse"] = []

    class Config:
        from_attributes = True

# WorkCenter Schemas
class WorkCenterBase(BaseModel):
    name: str
    code: str
    resource_calendar_id: Optional[int] = None
    capacity: Optional[float] = 1.0
    time_efficiency: Optional[float] = 100.0
    oee_target: Optional[float] = 85.0

class WorkCenterCreate(WorkCenterBase):
    pass

class WorkCenter(WorkCenterBase):
    id: int

    class Config:
        from_attributes = True

# Equipment Schemas
class EquipmentBase(BaseModel):
    name: str
    serial_number: str
    department: Optional[str] = None
    default_technician_id: Optional[str] = None
    status: Optional[EquipmentStatus] = EquipmentStatus.ACTIVE
    category_id: Optional[int] = None
    team_id: Optional[int] = None
    
    # New Fields
    employee_id: Optional[str] = None
    assign_date: Optional[date] = None
    scrap_date: Optional[date] = None
    purchase_date: Optional[date] = None
    warranty_date: Optional[date] = None
    location: Optional[str] = None
    work_center_id: Optional[int] = None

class EquipmentCreate(EquipmentBase):
    pass

class Equipment(EquipmentBase):
    id: int
    
    class Config:
        from_attributes = True

# Maintenance Request Schemas
class MaintenanceRequestBase(BaseModel):
    subject: str
    request_date: date
    scheduled_date: Optional[date] = None
    duration: Optional[float] = 0.0
    technician_id: Optional[str] = None
    maintenance_type: Optional[MaintenanceType] = MaintenanceType.CORRECTIVE
    priority: Optional[Priority] = Priority.LOW
    stage: Optional[RequestStage] = RequestStage.NEW_REQUEST
    description: Optional[str] = None
    
    # Updated Fields
    maintenance_for: Optional[MaintenanceFor] = MaintenanceFor.EQUIPMENT
    equipment_id: Optional[int] = None
    work_center_id: Optional[int] = None
    company_id: Optional[str] = None

    team_id: Optional[int] = None
    category_id: Optional[int] = None

class MaintenanceRequestCreate(MaintenanceRequestBase):
    pass

class MaintenanceRequestUpdate(BaseModel):
    subject: Optional[str] = None
    request_date: Optional[date] = None
    scheduled_date: Optional[date] = None
    duration: Optional[float] = None
    technician_id: Optional[str] = None
    maintenance_type: Optional[MaintenanceType] = None
    priority: Optional[Priority] = None
    stage: Optional[RequestStage] = None
    description: Optional[str] = None
    
    maintenance_for: Optional[MaintenanceFor] = None
    equipment_id: Optional[int] = None
    work_center_id: Optional[int] = None
    company_id: Optional[str] = None
    
    team_id: Optional[int] = None
    category_id: Optional[int] = None

class MaintenanceRequest(MaintenanceRequestBase):
    id: int
    category: Optional[Category] = None
    team: Optional[Team] = None

    class Config:
        from_attributes = True

# Statistic / Dashboard Schemas
class EquipmentCount(BaseModel):
    total: int
    maintenance_active: int

class DashboardStats(BaseModel):
    critical_equipment_count: int
    technician_load: int
    open_requests_count: int

class ReportItem(BaseModel):
    name: str
    count: int

class DashboardReports(BaseModel):
    requests_per_team: List[ReportItem]
    requests_per_category: List[ReportItem]

# User Schemas
class UserBase(BaseModel):
    email: str
    name: str
    role: Optional[str] = "User"

class UserCreate(UserBase):
    password: str
    team_id: Optional[int] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: int
    team_id: Optional[int] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
