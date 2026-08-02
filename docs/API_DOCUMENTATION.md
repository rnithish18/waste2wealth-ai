# Waste2Wealth AI - REST API Specification

Base URL: `http://localhost:5000/api/v1`

---

## Authentication Endpoints

### 1. Register User
`POST /auth/register`
- **Request Body**:
```json
{
  "company_name": "Apex Steel Industries",
  "email": "generator@waste2wealth.ai",
  "password": "password123",
  "industry_type": "Iron & Steel Foundry",
  "city": "Pune",
  "state": "Maharashtra",
  "role": "generator"
}
```
- **Response (200 OK)**: `TokenResponse` with JWT token and user object.

### 2. Login User
`POST /auth/login`
- **Request Body**:
```json
{
  "email": "generator@waste2wealth.ai",
  "password": "password123"
}
```

---

## Waste & Marketplace Endpoints

### 3. Create Waste Listing
`POST /waste`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: `WasteCreate` schema

### 4. Search Marketplace
`GET /waste/marketplace?category=Metals&min_price=1000`
- Returns filtered active waste listings.

---

## AI & Machine Learning Endpoints

### 5. Smart Waste Classifier
`POST /ai/classify`
- **Request Body**:
```json
{
  "waste_name": "Blast Furnace Steel Slag",
  "material_type": "Ferrous Slag",
  "description": "High density furnace slag for aggregate"
}
```

### 6. Buyer Recommendation Engine
`GET /ai/recommendations?waste_id=1`
- Returns top AI-ranked compatible buyer industries with distance and compatibility score.

### 7. Price Prediction
`POST /ai/price-predict`
- **Request Body**: `category`, `material_type`, `quantity`, `quality_grade`, `moisture_percentage`, `hazardous`

### 8. Carbon Impact Calculator
`POST /ai/carbon`
- **Request Body**: `category`, `quantity`
- Returns CO₂ saved (kg), trees equivalent, energy saved (kWh), landfill reduction (m³).
