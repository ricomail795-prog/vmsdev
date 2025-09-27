from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id = Column(Integer, primary_key=True, index=True)
    vessel_name = Column(String, index=True)
    system = Column(String, index=True)
    task = Column(String)
    description = Column(Text)
    due_date = Column(Date)
    status = Column(String, default="Pending")
    performed_by = Column(String)

    # Example relationship (if you add related tables later)
    # vessel_id = Column(Integer, ForeignKey("vessels.id"))
    # vessel = relationship("Vessel", back_populates="maintenance_records")

    from fastapi import APIRouter

router = APIRouter()

# Example endpoint
@router.get("/")
def get_maintenance_records():
    return {"message": "Maintenance endpoint works!"}

