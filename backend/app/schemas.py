from pydantic import BaseModel, EmailStr
from typing import Optional, List
import datetime

# Auth Schemas
class UserRegister(BaseModel):
    company_name: str
    email: str
    password: str
    gst_number: Optional[str] = None
    industry_type: str
    address: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = 20.5937
    longitude: Optional[float] = 78.9629
    role: Optional[str] = "generator"

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    company_name: str
    email: str
    gst_number: Optional[str]
    industry_type: str
    address: Optional[str]
    state: Optional[str]
    city: Optional[str]
    latitude: float
    longitude: float
    role: str
    is_verified: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Waste Schemas
class WasteCreate(BaseModel):
    waste_name: str
    category: str
    material_type: str
    description: Optional[str] = None
    quantity: float
    unit: Optional[str] = "tons"
    quality_grade: Optional[str] = "Grade A"
    moisture_percentage: Optional[float] = 5.0
    hazardous: Optional[bool] = False
    images: Optional[str] = None
    price: float
    availability: Optional[str] = "Immediate"
    pickup_location: Optional[str] = None
    latitude: Optional[float] = 20.5937
    longitude: Optional[float] = 78.9629

class WasteResponse(BaseModel):
    id: int
    user_id: int
    waste_name: str
    category: str
    material_type: str
    description: Optional[str]
    quantity: float
    unit: str
    quality_grade: str
    moisture_percentage: float
    hazardous: bool
    images: Optional[str]
    price: float
    availability: str
    pickup_location: Optional[str]
    latitude: float
    longitude: float
    status: str
    views: int
    carbon_offset_per_unit: float
    created_at: datetime.datetime
    owner: Optional[UserResponse] = None

    class Config:
        from_attributes = True

# AI Requests/Responses
class ClassifyRequest(BaseModel):
    waste_name: str
    description: Optional[str] = ""
    material_type: Optional[str] = ""

class ClassifyResponse(BaseModel):
    category: str
    recyclability_percent: float
    hazard_level: str
    material_confidence: float
    suggested_applications: List[str]
    estimated_price_range: str

class PricePredictRequest(BaseModel):
    category: str
    material_type: str
    quantity: float
    quality_grade: Optional[str] = "Grade A"
    moisture_percentage: Optional[float] = 5.0
    hazardous: Optional[bool] = False

class PricePredictResponse(BaseModel):
    predicted_price_per_unit: float
    recommended_min: float
    recommended_max: float
    market_demand_index: str
    confidence_score: float

class CarbonCalcRequest(BaseModel):
    category: str
    quantity: float

class CarbonCalcResponse(BaseModel):
    co2_saved_kg: float
    trees_equivalent: float
    energy_saved_kwh: float
    landfill_reduction_m3: float

class RouteOptimizeRequest(BaseModel):
    generator_lat: float
    generator_lng: float
    buyer_lat: float
    buyer_lng: float

class RouteOptimizeResponse(BaseModel):
    distance_km: float
    estimated_fuel_liters: float
    transport_co2_kg: float
    net_carbon_savings_kg: float

class BuyerMatchResponse(BaseModel):
    buyer_id: int
    company_name: str
    industry_type: str
    city: str
    distance_km: float
    match_score_percent: float
    compatibility_reason: str

# Transaction & Order
class OrderCreate(BaseModel):
    waste_id: int
    quantity: float

class OrderResponse(BaseModel):
    id: int
    waste_id: int
    seller_id: int
    buyer_id: int
    quantity: float
    total_price: float
    carbon_saved_kg: float
    status: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True
