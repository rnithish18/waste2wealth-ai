# Waste2Wealth AI - System Architecture & Design Specification

## Overview

Waste2Wealth AI is an end-to-end industrial waste exchange marketplace leveraging Machine Learning and AI to match waste-generating MSME industries with buyers capable of repurposing industrial by-products.

---

## 1. System Architecture Diagram

```mermaid
graph TD
    UserClient[React 18 + Vite + TypeScript Frontend]
    FastAPI[Python FastAPI API Gateway / Service Layer]
    DB[(PostgreSQL / SQLite Database)]
    MLEngine[Scikit-Learn & NumPy AI Engine]
    GroqLLM[Groq LLM API Service]

    UserClient -->|REST HTTP + JWT| FastAPI
    FastAPI -->|SQLAlchemy ORM| DB
    FastAPI -->|Classification & Pricing| MLEngine
    FastAPI -->|Enhanced Insights| GroqLLM
```

---

## 2. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USERS ||--o{ WASTE_LISTINGS : owns
    USERS ||--o{ TRANSACTIONS : buys_or_sells
    USERS ||--o{ CARBON_SAVINGS : accumulates
    USERS ||--o{ MESSAGES : sends_receives
    WASTE_LISTINGS ||--o{ TRANSACTIONS : involved_in
    TRANSACTIONS ||--o| CARBON_SAVINGS : generates

    USERS {
        int id PK
        string company_name
        string email
        string gst_number
        string industry_type
        string role
    }

    WASTE_LISTINGS {
        int id PK
        int user_id FK
        string waste_name
        string category
        float quantity
        float price
    }

    TRANSACTIONS {
        int id PK
        int waste_id FK
        int seller_id FK
        int buyer_id FK
        float total_price
        float carbon_saved_kg
    }
```

---

## 3. Sequence Diagram - Waste Upload & AI Matching Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Generator as Waste Generator
    participant App as React Frontend
    participant API as FastAPI Backend
    participant ML as ML Engine
    participant DB as PostgreSQL DB

    Generator->>App: Submits Waste Form (Details & Photos)
    App->>API: POST /api/v1/ai/classify
    API->>ML: Run TF-IDF + Cosine Classifier
    ML-->>API: Category, Hazard, Recyclability & Price Range
    API-->>App: Render AI Classification Preview
    Generator->>App: Confirm & Publish Listing
    App->>API: POST /api/v1/waste
    API->>DB: Save Waste Record & Carbon Impact
    API->>ML: Run Buyer Recommendation Matcher
    ML-->>API: Top Compatible Buyers
    API-->>App: Listing Published + Buyer Matches Shown
```

---

## 4. Key AI Components
1. **Smart Waste Classification**: Uses TF-IDF vectorization & Cosine Similarity on industrial waste descriptions trained on chemical, metal, fly ash, and polymer datasets.
2. **Buyer Recommendation Engine**: Combines industry compatibility matrices with spatial Haversine distance scoring.
3. **Price Prediction Engine**: Multi-variable regression calculating optimal pricing based on moisture %, quality grade, volume, and hazard tier.
4. **EPA Carbon Calculator**: Estimates CO₂ reduction (kg), tree absorption equivalents, kWh energy saved, and landfill diversion volume (m³).
