from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import WasteListing, User
from app.schemas import WasteCreate, WasteResponse
from app.utils.auth import require_current_user, get_current_user
from app.services.ml_engine import calculate_carbon_impact

router = APIRouter(tags=["Waste Listings"])

@router.post("/waste", response_model=WasteResponse)
def create_waste_listing(
    payload: WasteCreate,
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    carbon_stats = calculate_carbon_impact(payload.category, payload.quantity)
    co2_per_unit = round(carbon_stats["co2_saved_kg"] / max(payload.quantity, 1.0), 2)

    waste = WasteListing(
        user_id=current_user.id,
        waste_name=payload.waste_name,
        category=payload.category,
        material_type=payload.material_type,
        description=payload.description,
        quantity=payload.quantity,
        unit=payload.unit or "tons",
        quality_grade=payload.quality_grade or "Grade A",
        moisture_percentage=payload.moisture_percentage or 5.0,
        hazardous=payload.hazardous or False,
        images=payload.images or "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80",
        price=payload.price,
        availability=payload.availability or "Immediate",
        pickup_location=payload.pickup_location or f"{current_user.city}, {current_user.state}",
        latitude=payload.latitude or current_user.latitude,
        longitude=payload.longitude or current_user.longitude,
        status="active",
        views=0,
        carbon_offset_per_unit=co2_per_unit
    )
    db.add(waste)
    db.commit()
    db.refresh(waste)
    return waste

@router.get("/waste", response_model=List[WasteResponse])
@router.get("/marketplace", response_model=List[WasteResponse])
def get_waste_listings(
    category: Optional[str] = Query(None),
    material_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    hazardous: Optional[bool] = Query(None),
    sort_by: Optional[str] = Query("newest"),
    db: Session = Depends(get_db)
):
    query = db.query(WasteListing).filter(WasteListing.status == "active")

    if category and category.lower() != "all":
        query = query.filter(WasteListing.category == category)
    if material_type:
        query = query.filter(WasteListing.material_type.ilike(f"%{material_type}%"))
    if search:
        query = query.filter(
            (WasteListing.waste_name.ilike(f"%{search}%")) |
            (WasteListing.description.ilike(f"%{search}%")) |
            (WasteListing.material_type.ilike(f"%{search}%"))
        )
    if min_price is not None:
        query = query.filter(WasteListing.price >= min_price)
    if max_price is not None:
        query = query.filter(WasteListing.price <= max_price)
    if hazardous is not None:
        query = query.filter(WasteListing.hazardous == hazardous)

    if sort_by == "price_low":
        query = query.order_by(WasteListing.price.asc())
    elif sort_by == "price_high":
        query = query.order_by(WasteListing.price.desc())
    elif sort_by == "quantity":
        query = query.order_by(WasteListing.quantity.desc())
    else:
        query = query.order_by(WasteListing.created_at.desc())

    listings = query.all()
    return listings

@router.get("/waste/{waste_id}", response_model=WasteResponse)
def get_waste_by_id(waste_id: int, db: Session = Depends(get_db)):
    waste = db.query(WasteListing).filter(WasteListing.id == waste_id).first()
    if not waste:
        raise HTTPException(status_code=404, detail="Waste listing not found")

    waste.views += 1
    db.commit()
    db.refresh(waste)
    return waste

@router.put("/waste/{waste_id}", response_model=WasteResponse)
def update_waste(
    waste_id: int,
    payload: WasteCreate,
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    waste = db.query(WasteListing).filter(WasteListing.id == waste_id).first()
    if not waste:
        raise HTTPException(status_code=404, detail="Waste listing not found")
    if waste.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to edit this listing")

    waste.waste_name = payload.waste_name
    waste.category = payload.category
    waste.material_type = payload.material_type
    waste.description = payload.description
    waste.quantity = payload.quantity
    waste.price = payload.price

    db.commit()
    db.refresh(waste)
    return waste

@router.delete("/waste/{waste_id}")
def delete_waste(
    waste_id: int,
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    waste = db.query(WasteListing).filter(WasteListing.id == waste_id).first()
    if not waste:
        raise HTTPException(status_code=404, detail="Waste listing not found")
    if waste.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this listing")

    db.delete(waste)
    db.commit()
    return {"message": "Listing deleted successfully"}
