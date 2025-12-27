from sqlalchemy import Column, Integer, String, ForeignKey, Date, Enum, Float, Text
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class MaintenanceType(str, enum.Enum):
    CORRECTIVE = "Corrective"
    PREVENTIVE = "Preventive"

class Priority(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

class RequestStage(str, enum.Enum):
    NEW_REQUEST = "New Request"
    IN_PROGRESS = "In Progress"
    REPAIRED = "Repaired"
    SCRAP = "Scrap"

class EquipmentStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    MAINTENANCE = "MAINTENANCE"
    DECOMMISSIONED = "DECOMMISSIONED"

class MaintenanceFor(str, enum.Enum):
    EQUIPMENT = "Equipment"
    WORK_CENTER = "Work Center"

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    
    equipments = relationship("Equipment", back_populates="category")


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    
    equipments = relationship("Equipment", back_populates="team")
    requests = relationship("MaintenanceRequest", back_populates="team")
    users = relationship("User", back_populates="team", lazy="selectin")


class WorkCenter(Base):
    __tablename__ = "workcenters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    code = Column(String, unique=True, index=True)
    resource_calendar_id = Column(Integer, nullable=True) # Placeholder ID
    capacity = Column(Float, default=1.0)
    time_efficiency = Column(Float, default=100.0)
    oee_target = Column(Float, default=85.0)

    # Relationships
    equipments = relationship("Equipment", back_populates="work_center")
    requests = relationship("MaintenanceRequest", back_populates="work_center")


class Equipment(Base):
    __tablename__ = "equipments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    serial_number = Column(String, unique=True, index=True)
    department = Column(String)
    default_technician_id = Column(String) # Placeholder for Technician User ID
    status = Column(Enum(EquipmentStatus, values_callable=lambda obj: [e.value for e in obj]), default=EquipmentStatus.ACTIVE)
    
    # New Fields
    employee_id = Column(String, nullable=True) # Owner/Employee
    assign_date = Column(Date, nullable=True)
    scrap_date = Column(Date, nullable=True)
    purchase_date = Column(Date, nullable=True)
    warranty_date = Column(Date, nullable=True)
    location = Column(String, nullable=True)
    
    category_id = Column(Integer, ForeignKey("categories.id"))
    team_id = Column(Integer, ForeignKey("teams.id"))
    work_center_id = Column(Integer, ForeignKey("workcenters.id"), nullable=True)
    
    category = relationship("Category", back_populates="equipments")
    team = relationship("Team", back_populates="equipments")
    work_center = relationship("WorkCenter", back_populates="equipments")
    requests = relationship("MaintenanceRequest", back_populates="equipment")


class MaintenanceRequest(Base):
    __tablename__ = "maintenance_requests"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String, index=True)
    request_date = Column(Date)
    scheduled_date = Column(Date)
    duration = Column(Float) # Hours
    technician_id = Column(String) # Placeholder for Technician User ID
    
    maintenance_type = Column(Enum(MaintenanceType), default=MaintenanceType.CORRECTIVE)
    priority = Column(Enum(Priority), default=Priority.LOW)
    stage = Column(Enum(RequestStage), default=RequestStage.NEW_REQUEST)

    description = Column(Text)

    # Request can be for Equipment OR WorkCenter
    maintenance_for = Column(Enum(MaintenanceFor), default=MaintenanceFor.EQUIPMENT)
    
    equipment_id = Column(Integer, ForeignKey("equipments.id"), nullable=True)
    work_center_id = Column(Integer, ForeignKey("workcenters.id"), nullable=True)
    
    team_id = Column(Integer, ForeignKey("teams.id"))
    category_id = Column(Integer, ForeignKey("categories.id"))
    company_id = Column(String, nullable=True) # Placeholder for Company Name/ID

    equipment = relationship("Equipment", back_populates="requests")
    work_center = relationship("WorkCenter", back_populates="requests")
    team = relationship("Team", back_populates="requests")
    category = relationship("Category") 


class UserRole(str, enum.Enum):
    ADMIN = "Admin"
    TECHNICIAN = "Technician"
    USER = "User"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    hashed_password = Column(String)
    role = Column(Enum(UserRole), default=UserRole.USER)
    
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    
    team = relationship("Team", back_populates="users")
 
