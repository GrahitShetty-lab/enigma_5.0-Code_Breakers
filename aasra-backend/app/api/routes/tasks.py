import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.case import Case
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskAssign, TaskResponse
from app.api.routes.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(tags=["tasks"])


@router.get("/api/cases/{case_id}/tasks", response_model=List[TaskResponse])
def list_case_tasks(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all follow-up closing tasks for a case."""
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    tasks = db.query(Task).filter(Task.case_id == case_id).all()
    return tasks


@router.post("/api/cases/{case_id}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    case_id: str,
    data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a manual closing task for a case."""
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    task = Task(
        case_id=case_id,
        asset_id=data.asset_id,
        title=data.title,
        description=data.description,
        priority=data.priority or "MEDIUM",
        assigned_to=data.assigned_to,
        due_date=data.due_date,
        status=data.status or "pending",
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.patch("/api/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: str,
    data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update task status, priority, or details."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    case = db.query(Case).filter(Case.id == task.case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    update_dict = data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


@router.post("/api/tasks/{task_id}/assign", response_model=TaskResponse)
def assign_task(
    task_id: str,
    data: TaskAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Assign task to a specific family member."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    case = db.query(Case).filter(Case.id == task.case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    task.assigned_to = data.assigned_to
    db.commit()
    db.refresh(task)
    return task
