from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import WasteListing, User
from app.schemas import (
    ClassifyRequest, ClassifyResponse,
    PricePredictRequest, PricePredictResponse,
    CarbonCalcRequest, CarbonCalcResponse,
    RouteOptimizeRequest, RouteOptimizeResponse,
    BuyerMatchResponse
)
from app.services.ml_engine import (
    classify_waste, predict_waste_price, calculate_carbon_impact,
    optimize_transport_route, recommend_buyers_for_waste, forecast_waste_generation
)
from app.config import settings
import requests

router = APIRouter(prefix="/ai", tags=["AI & Machine Learning"])

@router.post("/classify", response_model=ClassifyResponse)
def api_classify_waste(payload: ClassifyRequest):
    result = classify_waste(payload.waste_name, payload.description or "", payload.material_type or "")

    # Optional Groq LLM enhancement if key is active
    if settings.GROQ_API_KEY and settings.GROQ_API_KEY.startswith("gsk_"):
        try:
            resp = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {settings.GROQ_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": "llama3-8b-8192",
                    "messages": [
                        {"role": "system", "content": "You are an expert industrial chemical and waste recycling engineer."},
                        {"role": "user", "content": f"Provide 3 specific industrial recycling applications for {payload.waste_name} ({payload.material_type}). Return only bullet points."}
                    ],
                    "max_tokens": 100
                },
                timeout=3
            )
            if resp.status_code == 200:
                data = resp.json()
                text = data["choices"][0]["message"]["content"]
                bullets = [line.strip("- *•") for line in text.split("\n") if line.strip("- *•")]
                if len(bullets) >= 2:
                    result["suggested_applications"] = bullets[:3]
        except Exception:
            pass  # Fallback to ML classification gracefully

    return result

@router.post("/price-predict", response_model=PricePredictResponse)
def api_predict_price(payload: PricePredictRequest):
    return predict_waste_price(
        category=payload.category,
        material_type=payload.material_type,
        quantity=payload.quantity,
        quality_grade=payload.quality_grade or "Grade A",
        moisture_percentage=payload.moisture_percentage or 5.0,
        hazardous=payload.hazardous or False
    )

@router.post("/carbon", response_model=CarbonCalcResponse)
def api_calculate_carbon(payload: CarbonCalcRequest):
    return calculate_carbon_impact(payload.category, payload.quantity)

@router.post("/optimize-route", response_model=RouteOptimizeResponse)
def api_optimize_route(payload: RouteOptimizeRequest):
    return optimize_transport_route(
        payload.generator_lat, payload.generator_lng,
        payload.buyer_lat, payload.buyer_lng
    )

@router.get("/recommendations", response_model=List[BuyerMatchResponse])
@router.get("/recommendations/{waste_id}")
@router.get("/recommend-buyers")
def api_recommend_buyers(waste_id: Optional[int] = None, db: Session = Depends(get_db)):
    if waste_id:
        waste = db.query(WasteListing).filter(WasteListing.id == waste_id).first()
        if not waste:
            waste = db.query(WasteListing).first()
    else:
        waste = db.query(WasteListing).first()

    if not waste:
        return {"data": {"recommendations": []}, "recommendations": []}

    buyers = db.query(User).filter(User.role.in_(["buyer", "generator"])).all()
    recs = recommend_buyers_for_waste(waste, buyers)
    
    # Format to match frontend structure expected
    formatted = []
    for r in recs:
        formatted.append({
            "buyer": {
                "_id": str(r["buyer_id"]),
                "id": r["buyer_id"],
                "companyName": r["company_name"],
                "industryType": r["industry_type"],
                "city": r["city"],
                "rating": 4.8
            },
            "distanceKm": r["distance_km"],
            "matchScore": r["match_score_percent"],
            "aiExplanation": r["compatibility_reason"]
        })

    return {"data": {"recommendations": formatted}, "recommendations": formatted}

@router.post("/forecast")
def api_forecast_waste():
    return forecast_waste_generation()
