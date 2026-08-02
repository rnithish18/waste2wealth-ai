-- Waste2Wealth AI - Industrial Waste Exchange Platform
-- PostgreSQL Database Schema for Supabase / Production Deployment

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    gst_number VARCHAR(50),
    industry_type VARCHAR(100) NOT NULL,
    address TEXT,
    state VARCHAR(100),
    city VARCHAR(100),
    latitude DOUBLE PRECISION DEFAULT 20.5937,
    longitude DOUBLE PRECISION DEFAULT 78.9629,
    role VARCHAR(50) DEFAULT 'generator', -- generator, buyer, admin
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Waste Listings Table
CREATE TABLE IF NOT EXISTS waste_listings (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    waste_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- Metals, Plastics, Chemicals, Organic, Fly Ash, E-waste, Textiles, Rubber
    material_type VARCHAR(150) NOT NULL,
    description TEXT,
    quantity DOUBLE PRECISION NOT NULL,
    unit VARCHAR(50) DEFAULT 'tons',
    quality_grade VARCHAR(50) DEFAULT 'Grade A',
    moisture_percentage DOUBLE PRECISION DEFAULT 5.0,
    hazardous BOOLEAN DEFAULT FALSE,
    images TEXT,
    price DOUBLE PRECISION NOT NULL,
    availability VARCHAR(100) DEFAULT 'Immediate',
    pickup_location VARCHAR(255),
    latitude DOUBLE PRECISION DEFAULT 20.5937,
    longitude DOUBLE PRECISION DEFAULT 78.9629,
    status VARCHAR(50) DEFAULT 'active', -- active, pending, sold, archived
    views INT DEFAULT 0,
    carbon_offset_per_unit DOUBLE PRECISION DEFAULT 1.8,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    waste_id INT NOT NULL REFERENCES waste_listings(id) ON DELETE CASCADE,
    seller_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    buyer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quantity DOUBLE PRECISION NOT NULL,
    total_price DOUBLE PRECISION NOT NULL,
    carbon_saved_kg DOUBLE PRECISION DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Carbon Savings Table
CREATE TABLE IF NOT EXISTS carbon_savings (
    id SERIAL PRIMARY KEY,
    transaction_id INT REFERENCES transactions(id) ON DELETE SET NULL,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    co2_saved_kg DOUBLE PRECISION NOT NULL,
    trees_equivalent DOUBLE PRECISION NOT NULL,
    energy_saved_kwh DOUBLE PRECISION NOT NULL,
    landfill_reduction_m3 DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    waste_id INT REFERENCES waste_listings(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for High Performance Querying
CREATE INDEX IF NOT EXISTS idx_waste_category ON waste_listings(category);
CREATE INDEX IF NOT EXISTS idx_waste_status ON waste_listings(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_messages_users ON messages(sender_id, receiver_id);
