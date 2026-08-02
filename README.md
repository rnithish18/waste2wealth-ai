# Waste2Wealth AI – Industrial Waste Exchange Platform

> **MSME Hackathon Project Entry**  
> An AI-powered industrial circular economy marketplace connecting waste-generating industries with buyer industries to repurpose industrial waste into valuable raw materials.

---

## 🌟 Key Features

1. **Smart Waste Classifier**: Automatically predicts category, recyclability %, hazard rating, confidence score, and market price using Scikit-Learn TF-IDF + Random Forest models.
2. **Buyer Recommendation Engine**: Ranks buyer industries based on material compatibility, Haversine distance, and purchase history.
3. **Price Prediction ML Model**: Machine learning regression model predicting market valuation for industrial by-products.
4. **EPA Carbon Saving Calculator**: Calculates CO₂ saved (kg), equivalent trees planted, energy saved (kWh), and landfill reduction (m³).
5. **Waste Forecast Engine**: Predictive time-series model for industrial waste generation trends.
6. **Transport Route & Carbon Optimizer**: Interactive route optimization computing fuel usage and transport emissions.
7. **Interactive Leaflet Map**: Dynamic spatial visualization of nearby industries, pickup locations, and active waste listings.
8. **Recharts Analytics Hub**: Real-time revenue charts, carbon offset metrics, and material breakdown graphs.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Leaflet.js, Recharts, Framer Motion, Lucide Icons
- **Backend**: Python FastAPI, SQLAlchemy ORM, Pydantic v2, JWT Auth, SQLite/PostgreSQL
- **AI & ML**: Scikit-Learn, Pandas, NumPy, Groq LLM API Service
- **Deployment**: Docker, Vercel, Render, Supabase

---

## 🚀 Quick Start Instructions

### 1. Start Python FastAPI Backend
```bash
cd backend
python -m pip install -r requirements.txt
python seed.py
python -m uvicorn app.main:app --port 5000 --reload
```
- API Documentation (Swagger): `http://localhost:5000/docs`

### 2. Start React Frontend
```bash
cd waste2wealth-frontend/waste2wealth-frontend
npm install
npm run dev
```
- Local Application URL: `http://localhost:5173`

---

## 🔑 Demo Login Credentials

- **Waste Generator Industry**: `generator@waste2wealth.ai` / `password123`
- **Buyer Industry**: `buyer@waste2wealth.ai` / `password123`
- **Platform Administrator**: `admin@waste2wealth.ai` / `admin123`
