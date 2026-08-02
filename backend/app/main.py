import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models import User
from app.routers import auth, waste, ai, transactions, messages, notifications, analytics, admin

# Create database tables automatically
Base.metadata.create_all(bind=engine)

# Automatically seed database on startup if empty (fixes Render ephemeral container issue)
try:
    db = SessionLocal()
    user_count = db.query(User).count()
    if user_count == 0:
        print("[STARTUP] Database empty. Running seed_database()...")
        from seed import seed_database
        seed_database()
    db.close()
except Exception as e:
    print(f"[STARTUP WARNING] Seed check: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Waste2Wealth AI - Industrial Waste Exchange Platform REST API & Machine Learning Module"
)

# Enable CORS for local & production frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(waste.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(transactions.router, prefix=settings.API_V1_STR)
app.include_router(messages.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "title": settings.PROJECT_NAME,
        "status": "online",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "ai_engine": "Scikit-Learn + Pandas + Groq AI Active"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=5000, reload=True)
