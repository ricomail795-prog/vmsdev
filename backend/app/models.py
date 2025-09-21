from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    CAPTAIN = "captain"
    CREW = "crew"
    MANAGER = "manager"

class CertificateType(str, Enum):
    COC = "Certificates of Competency (CoC)"
    STCW = "STCW Basic Training"
    GMDSS = "GMDSS"
    MEDICAL = "Seafarers Medical"
    OTHER = "Other"

class User(BaseModel):
    id: Optional[int] = None
    email: EmailStr
    first_name: Optional[str] = None
    surname: Optional[str] = None
    role: UserRole = UserRole.CREW
    is_active: bool = True
    created_at: Optional[datetime] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: Optional[str] = None
    surname: Optional[str] = None
    role: UserRole = UserRole.CREW

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    first_name: Optional[str] = None
    surname: Optional[str] = None
    date_of_birth: Optional[date] = None
    building_house: Optional[str] = None
    street_address: Optional[str] = None
    city_town: Optional[str] = None
    county_state: Optional[str] = None
    postal_zip: Optional[str] = None
    country: Optional[str] = None
    telephone: Optional[str] = None
    nationality: Optional[str] = None

class NextOfKin(BaseModel):
    id: Optional[int] = None
    user_id: int
    full_name: str
    relationship: str
    building_house: Optional[str] = None
    street_address: Optional[str] = None
    city_town: Optional[str] = None
    county_state: Optional[str] = None
    postal_zip: Optional[str] = None
    country: Optional[str] = None
    telephone: Optional[str] = None

class MedicalInfo(BaseModel):
    id: Optional[int] = None
    user_id: int
    surgery_name: Optional[str] = None
    building_house: Optional[str] = None
    street_address: Optional[str] = None
    city_town: Optional[str] = None
    county_state: Optional[str] = None
    postal_zip: Optional[str] = None
    country: Optional[str] = None
    doctor_name: Optional[str] = None
    doctor_phone: Optional[str] = None
    chronic_illnesses: bool = False
    taking_medication: bool = False
    recent_surgery: bool = False
    allergies: bool = False

class Certificate(BaseModel):
    id: Optional[int] = None
    user_id: int
    certificate_type: CertificateType
    valid_from: date
    expiry_date: date
    issued_by: str
    file_path: Optional[str] = None
    created_at: Optional[datetime] = None

class Vessel(BaseModel):
    id: Optional[int] = None
    name: str
    imo_number: Optional[str] = None
    vessel_type: str
    flag_state: str
    gross_tonnage: Optional[float] = None
    length: Optional[float] = None
    beam: Optional[float] = None
    year_built: Optional[int] = None
    is_active: bool = True
    created_at: Optional[datetime] = None

class CrewAssignment(BaseModel):
    id: Optional[int] = None
    user_id: int
    vessel_id: int
    position: str
    start_date: date
    end_date: Optional[date] = None
    is_active: bool = True

class MaintenanceRecord(BaseModel):
    id: Optional[int] = None
    vessel_id: int
    title: str
    description: str
    maintenance_type: str
    scheduled_date: date
    completed_date: Optional[date] = None
    status: str = "pending"
    assigned_to: Optional[int] = None
    cost: Optional[float] = None
    created_by: int
    created_at: Optional[datetime] = None

class SafetyRecord(BaseModel):
    id: Optional[int] = None
    vessel_id: int
    incident_type: str
    description: str
    incident_date: date
    severity: str
    reported_by: int
    status: str = "open"
    corrective_actions: Optional[str] = None
    created_at: Optional[datetime] = None

class QHSERecord(BaseModel):
    id: Optional[int] = None
    vessel_id: int
    audit_type: str
    audit_date: date
    auditor: str
    findings: str
    compliance_score: Optional[int] = None
    corrective_actions: Optional[str] = None
    status: str = "open"
    created_by: int
    created_at: Optional[datetime] = None

class ElectronicSignature(BaseModel):
    id: Optional[int] = None
    user_id: int
    signature_data: str
    signature_type: str = "drawn"
    created_at: Optional[datetime] = None
    is_active: bool = True
