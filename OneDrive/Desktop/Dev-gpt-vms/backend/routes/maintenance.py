from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from backend.models.maintenance import MaintenanceTask
import shutil, os

router = APIRouter(prefix="/api/maintenance", tags=["maintenance"])

UPLOAD_DIR = "uploads/maintenance"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/")
def get_tasks(db: Session = Depends(get_db)):
    return db.query(MaintenanceTask).all()

@router.get("/{task_id}")
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(MaintenanceTask).filter(MaintenanceTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.post("/")
def create_task(task: dict, db: Session = Depends(get_db)):
    new_task = MaintenanceTask(
        task_name=task.get("task_name"),
        description=task.get("description"),
        vessel_id=task.get("vessel_id"),
        assigned_to=task.get("assigned_to"),
        due_date=task.get("due_date"),
        status=task.get("status", "Pending"),
        cost=task.get("cost"),
        remarks=task.get("remarks"),
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@router.put("/{task_id}")
def update_task(task_id: int, task_data: dict, db: Session = Depends(get_db)):
    task = db.query(MaintenanceTask).filter(MaintenanceTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    for key, value in task_data.items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(MaintenanceTask).filter(MaintenanceTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"detail": "Task deleted"}

@router.post("/{task_id}/evidence")
def upload_evidence(task_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    task = db.query(MaintenanceTask).filter(MaintenanceTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    task.evidence_file = file_path
    db.commit()
    db.refresh(task)
    return {"filename": file.filename, "path": file_path}
