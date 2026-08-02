from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
import datetime
from app.database import get_db
from app.models import Notification, User
from app.utils.auth import require_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

@router.get("", response_model=List[NotificationOut])
def get_notifications(
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    notes = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).all()
    return notes

@router.put("/{notification_id}/read")
def mark_read(
    notification_id: int,
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    note = db.query(Notification).filter(
        Notification.id == notification_id, Notification.user_id == current_user.id
    ).first()
    if note:
        note.is_read = True
        db.commit()
    return {"message": "Marked as read"}
