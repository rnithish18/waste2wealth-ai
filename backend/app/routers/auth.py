from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserRegister, UserLogin, UserResponse, TokenResponse
from app.utils.auth import get_password_hash, verify_password, create_access_token, require_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register_user(payload: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered. Please login instead."
        )

    user = User(
        company_name=payload.company_name,
        email=payload.email.lower().strip(),
        hashed_password=get_password_hash(payload.password),
        gst_number=payload.gst_number,
        industry_type=payload.industry_type,
        address=payload.address,
        state=payload.state,
        city=payload.city,
        latitude=payload.latitude or 20.5937,
        longitude=payload.longitude or 78.9629,
        role=payload.role or "generator",
        is_verified=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/login", response_model=TokenResponse)
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/logout")
def logout_user():
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(require_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(
    company_name: str = None,
    gst_number: str = None,
    address: str = None,
    city: str = None,
    state: str = None,
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    if company_name:
        current_user.company_name = company_name
    if gst_number:
        current_user.gst_number = gst_number
    if address:
        current_user.address = address
    if city:
        current_user.city = city
    if state:
        current_user.state = state

    db.commit()
    db.refresh(current_user)
    return current_user
