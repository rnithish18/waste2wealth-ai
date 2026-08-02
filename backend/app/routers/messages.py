from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import datetime
from app.database import get_db
from app.models import Message, User
from app.utils.auth import require_current_user

router = APIRouter(prefix="/messages", tags=["Messaging"])

class MessageCreate(BaseModel):
    receiver_id: int
    content: str
    waste_id: Optional[int] = None

class MessageOut(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    is_read: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

@router.post("", response_model=MessageOut)
def send_message(
    payload: MessageCreate,
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    msg = Message(
        sender_id=current_user.id,
        receiver_id=payload.receiver_id,
        waste_id=payload.waste_id,
        content=payload.content
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg

@router.get("/{other_user_id}", response_model=List[MessageOut])
def get_chat_history(
    other_user_id: int,
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    msgs = db.query(Message).filter(
        ((Message.sender_id == current_user.id) & (Message.receiver_id == other_user_id)) |
        ((Message.sender_id == other_user_id) & (Message.receiver_id == current_user.id))
    ).order_by(Message.created_at.asc()).all()

    # Mark unread as read
    for m in msgs:
        if m.receiver_id == current_user.id and not m.is_read:
            m.is_read = True
    db.commit()

    return msgs
