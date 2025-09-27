from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import Base, engine, SessionLocal
from app.models.maintenance import MaintenanceRecord
from typing import List
from pydantic import BaseModel
import datetime

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Vessel Management System API")

# Dependency for DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic schema for Maintenance
class MaintenanceCreate(BaseModel):
    vessel_name: str
    system: str
    task: str
    description: str
    due_date: datetime.date
    performed_by: str

class MaintenanceOut(MaintenanceCreate):
    id: int
    status: str

    class Config:
        orm_mode = True

# Root route
@app.get("/")
def root():
    return {"message": "Backend is running successfully!"}

# --- Maintenance Endpoints ---
@app.post("/maintenance/", response_model=MaintenanceOut)
def create_maintenance(record: MaintenanceCreate, db: Session = Depends(get_db)):
    db_record = MaintenanceRecord(**record.dict())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@app.get("/maintenance/", response_model=List[MaintenanceOut])
def get_all_maintenance(db: Session = Depends(get_db)):
    return db.query(MaintenanceRecord).all()

@app.get("/maintenance/{record_id}", response_model=MaintenanceOut)
def get_maintenance(record_id: int, db: Session = Depends(get_db)):
    record = db.query(MaintenanceRecord).filter(MaintenanceRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    return record

@app.delete("/maintenance/{record_id}")
def delete_maintenance(record_id: int, db: Session = Depends(get_db)):
    record = db.query(MaintenanceRecord).filter(MaintenanceRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    db.delete(record)
    db.commit()
    return {"message": f"Maintenance record {record_id} deleted"}
