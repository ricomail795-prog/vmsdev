from sqlalchemy import Column, Integer, String, Text, Date
from app.database import Base

class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id = Column(Integer, primary_key=True, index=True)
    vessel_name = Column(String, index=True)
    system = Column(String, index=True)
    task = Column(String, index=True)
    description = Column(Text)
    due_date = Column(Date)
    status = Column(String, default="pending")
    performed_by = Column(String)
