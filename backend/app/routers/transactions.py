from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Transaction, WasteListing, User, CarbonSaving
from app.schemas import OrderCreate, OrderResponse
from app.utils.auth import require_current_user
from app.services.ml_engine import calculate_carbon_impact

router = APIRouter(tags=["Transactions & Orders"])

@router.post("/orders", response_model=OrderResponse)
@router.post("/transactions", response_model=OrderResponse)
def create_order(
    payload: OrderCreate,
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    waste = db.query(WasteListing).filter(WasteListing.id == payload.waste_id).first()
    if not waste:
        raise HTTPException(status_code=404, detail="Waste listing not found")

    if waste.quantity < payload.quantity:
        raise HTTPException(status_code=400, detail="Requested quantity exceeds available stock")

    total_price = waste.price * payload.quantity
    carbon_stats = calculate_carbon_impact(waste.category, payload.quantity)
    carbon_saved = carbon_stats["co2_saved_kg"]

    tx = Transaction(
        waste_id=waste.id,
        seller_id=waste.user_id,
        buyer_id=current_user.id,
        quantity=payload.quantity,
        total_price=total_price,
        carbon_saved_kg=carbon_saved,
        status="completed"
    )
    db.add(tx)

    # Deduct stock or mark sold
    waste.quantity -= payload.quantity
    if waste.quantity <= 0:
        waste.status = "sold"

    # Record Carbon Savings
    cs = CarbonSaving(
        transaction_id=tx.id,
        user_id=current_user.id,
        co2_saved_kg=carbon_saved,
        trees_equivalent=carbon_stats["trees_equivalent"],
        energy_saved_kwh=carbon_stats["energy_saved_kwh"],
        landfill_reduction_m3=carbon_stats["landfill_reduction_m3"]
    )
    db.add(cs)

    db.commit()
    db.refresh(tx)
    return tx

@router.get("/transactions", response_model=List[OrderResponse])
@router.get("/orders", response_model=List[OrderResponse])
def get_user_transactions(
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    txs = db.query(Transaction).filter(
        (Transaction.buyer_id == current_user.id) | (Transaction.seller_id == current_user.id)
    ).order_by(Transaction.created_at.desc()).all()
    return txs
