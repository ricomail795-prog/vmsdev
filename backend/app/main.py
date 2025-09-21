from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from datetime import timedelta
from typing import List, Optional
from .models import *
from .database import db
from .auth import (
    authenticate_user, 
    create_access_token, 
    get_current_user, 
    get_password_hash,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    require_admin,
    require_admin_or_manager
)

app = FastAPI(title="Vessel Management System API", version="1.0.0")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.post("/auth/register")
async def register(user_data: UserCreate):
    existing_user = db.get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(user_data.password)
    user_dict = user_data.model_dump()
    user_dict["hashed_password"] = hashed_password
    del user_dict["password"]
    
    user = db.create_user(user_dict)
    return {"message": "User created successfully", "user_id": user["id"]}

@app.post("/auth/login")
async def login(user_credentials: UserLogin):
    user = authenticate_user(user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["id"])}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "first_name": user.get("first_name"),
            "surname": user.get("surname"),
            "role": user["role"]
        }
    }

@app.get("/auth/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "first_name": current_user.get("first_name"),
        "surname": current_user.get("surname"),
        "role": current_user["role"]
    }

@app.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    profile = db.get_user_profile(current_user["id"])
    return profile or {}

@app.put("/profile")
async def update_profile(profile_data: UserProfile, current_user: dict = Depends(get_current_user)):
    profile_dict = profile_data.model_dump(exclude_unset=True)
    updated_profile = db.update_user_profile(current_user["id"], profile_dict)
    return updated_profile

@app.get("/certificates")
async def get_certificates(current_user: dict = Depends(get_current_user)):
    certificates = db.get_user_certificates(current_user["id"])
    return certificates

@app.post("/certificates")
async def create_certificate(cert_data: Certificate, current_user: dict = Depends(get_current_user)):
    cert_dict = cert_data.model_dump()
    cert_dict["user_id"] = current_user["id"]
    certificate = db.create_certificate(cert_dict)
    return certificate

@app.get("/next-of-kin")
async def get_next_of_kin(current_user: dict = Depends(get_current_user)):
    next_of_kin = db.get_user_next_of_kin(current_user["id"])
    return next_of_kin or {}

@app.put("/next-of-kin")
async def update_next_of_kin(kin_data: NextOfKin, current_user: dict = Depends(get_current_user)):
    kin_dict = kin_data.model_dump(exclude_unset=True)
    kin_dict["user_id"] = current_user["id"]
    updated_kin = db.update_user_next_of_kin(current_user["id"], kin_dict)
    return updated_kin

@app.get("/medical-info")
async def get_medical_info(current_user: dict = Depends(get_current_user)):
    medical_info = db.get_user_medical_info(current_user["id"])
    return medical_info or {}

@app.put("/medical-info")
async def update_medical_info(medical_data: MedicalInfo, current_user: dict = Depends(get_current_user)):
    medical_dict = medical_data.model_dump(exclude_unset=True)
    medical_dict["user_id"] = current_user["id"]
    updated_medical = db.update_user_medical_info(current_user["id"], medical_dict)
    return updated_medical

@app.get("/electronic-signature")
async def get_electronic_signature(current_user: dict = Depends(get_current_user)):
    signature = db.get_user_electronic_signature(current_user["id"])
    return signature or {}

@app.put("/electronic-signature")
async def update_electronic_signature(signature_data: ElectronicSignature, current_user: dict = Depends(get_current_user)):
    signature_dict = signature_data.model_dump(exclude_unset=True)
    signature_dict["user_id"] = current_user["id"]
    updated_signature = db.update_user_electronic_signature(current_user["id"], signature_dict)
    return updated_signature

@app.get("/vessels")
async def get_vessels(current_user: dict = Depends(get_current_user)):
    vessels = db.get_vessels()
    return vessels

@app.get("/vessels/{vessel_id}")
async def get_vessel(vessel_id: int, current_user: dict = Depends(get_current_user)):
    vessel = db.get_vessel_by_id(vessel_id)
    if not vessel:
        raise HTTPException(status_code=404, detail="Vessel not found")
    return vessel

@app.get("/maintenance")
async def get_maintenance_records(vessel_id: Optional[int] = None, current_user: dict = Depends(get_current_user)):
    records = db.get_maintenance_records(vessel_id)
    return records

@app.post("/maintenance")
async def create_maintenance_record(maintenance_data: MaintenanceRecord, current_user: dict = Depends(get_current_user)):
    maintenance_dict = maintenance_data.model_dump()
    maintenance_dict["created_by"] = current_user["id"]
    record = db.create_maintenance_record(maintenance_dict)
    return record

@app.get("/safety")
async def get_safety_records(vessel_id: Optional[int] = None, current_user: dict = Depends(get_current_user)):
    records = db.get_safety_records(vessel_id)
    return records

@app.post("/safety")
async def create_safety_record(safety_data: SafetyRecord, current_user: dict = Depends(get_current_user)):
    safety_dict = safety_data.model_dump()
    safety_dict["reported_by"] = current_user["id"]
    record = db.create_safety_record(safety_dict)
    return record

@app.post("/vessels")
async def create_vessel(vessel_data: Vessel, admin_user: dict = Depends(require_admin)):
    vessel_dict = vessel_data.model_dump()
    vessel = db.create_vessel(vessel_dict)
    return vessel

@app.get("/crew-assignments")
async def get_crew_assignments(
    user_id: Optional[int] = None, 
    vessel_id: Optional[int] = None,
    current_user: dict = Depends(get_current_user)
):
    assignments = db.get_crew_assignments(user_id, vessel_id)
    return assignments

@app.post("/crew-assignments")
async def create_crew_assignment(assignment_data: CrewAssignment, current_user: dict = Depends(get_current_user)):
    assignment_dict = assignment_data.model_dump()
    assignment_dict["user_id"] = current_user["id"]
    
    existing_assignment = db.get_user_current_assignment(current_user["id"])
    if existing_assignment:
        db.update_crew_assignment(existing_assignment["id"], {"is_active": False})
    
    assignment = db.create_crew_assignment(assignment_dict)
    return assignment

@app.get("/my-assignment")
async def get_my_assignment(current_user: dict = Depends(get_current_user)):
    assignment = db.get_user_current_assignment(current_user["id"])
    if assignment:
        vessel = db.get_vessel_by_id(assignment["vessel_id"])
        return {
            "assignment": assignment,
            "vessel": vessel
        }
    return None

@app.get("/dashboard")
async def get_dashboard_data(current_user: dict = Depends(get_current_user)):
    vessels = db.get_vessels()
    maintenance_records = db.get_maintenance_records()
    safety_records = db.get_safety_records()
    
    total_vessels = len(vessels)
    active_vessels = len([v for v in vessels if v["is_active"]])
    pending_maintenance = len([m for m in maintenance_records if m["status"] == "pending"])
    open_safety_issues = len([s for s in safety_records if s["status"] == "open"])
    
    user_assignment = None
    if current_user["role"] == "crew":
        user_assignment = db.get_user_current_assignment(current_user["id"])
    
    return {
        "total_vessels": total_vessels,
        "active_vessels": active_vessels,
        "pending_maintenance": pending_maintenance,
        "open_safety_issues": open_safety_issues,
        "recent_vessels": vessels[:5],
        "recent_maintenance": maintenance_records[:5],
        "recent_safety": safety_records[:5],
        "user_assignment": user_assignment
    }
