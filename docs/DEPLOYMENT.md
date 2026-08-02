# Waste2Wealth AI - Deployment Guide

This guide details how to deploy the platform to production using **Vercel** (Frontend), **Render** (FastAPI Backend), and **Supabase** (PostgreSQL Database).

---

## 1. Supabase PostgreSQL Setup
1. Log in to [Supabase](https://supabase.com) and create a new project.
2. Go to SQL Editor and run the contents of `database/schema.sql`.
3. Copy the Connection String URI under Project Settings -> Database.

---

## 2. Render Backend Deployment
1. Log in to [Render](https://render.com) and click **New Web Service**.
2. Connect your Git repository.
3. Set Environment Settings:
   - Environment: `Python 3`
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Set Environment Variables:
   - `DATABASE_URL`: Your Supabase connection string.
   - `SECRET_KEY`: Random 64-char string.
   - `GROQ_API_KEY`: Your Groq API key.

---

## 3. Vercel Frontend Deployment
1. Log in to [Vercel](https://vercel.com) and import the repository.
2. Root Directory: `waste2wealth-frontend/waste2wealth-frontend`
3. Framework Preset: `Vite`
4. Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-render-backend.onrender.com/api/v1`
5. Click **Deploy**.

---

## 4. Docker Deployment (Local or VPS)

Run the following single command to build and launch all services:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API Docs: `http://localhost:5000/docs`
