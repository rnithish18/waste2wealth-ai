import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app.models import User, WasteListing, Transaction, CarbonSaving, Message, Notification
from app.utils.auth import get_password_hash
from app.services.ml_engine import calculate_carbon_impact

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    print("[SEED] Seeding Users...")
    # Demo Users
    user_gen1 = User(
        company_name="Apex Steel Industries Pvt Ltd",
        email="generator@waste2wealth.ai",
        hashed_password=get_password_hash("password123"),
        gst_number="27AAACA12341Z5",
        industry_type="Iron & Steel Foundry",
        address="MIDC Industrial Area, Zone 4",
        city="Pune",
        state="Maharashtra",
        latitude=18.5204,
        longitude=73.8567,
        role="generator",
        is_verified=True
    )
    user_gen2 = User(
        company_name="Vanguard Chemicals & Polymers",
        email="vanguard@waste2wealth.ai",
        hashed_password=get_password_hash("password123"),
        gst_number="24BBBCB56782Z9",
        industry_type="Chemical Processing",
        address="GIDC Estate, Phase II",
        city="Vadodara",
        state="Gujarat",
        latitude=22.3072,
        longitude=73.1812,
        role="generator",
        is_verified=True
    )

    user_buyer1 = User(
        company_name="EcoCement India Solutions",
        email="buyer@waste2wealth.ai",
        hashed_password=get_password_hash("password123"),
        gst_number="07CCCCD90123Z1",
        industry_type="Cement & Building Materials",
        address="Plot 45, Industrial Corridor",
        city="Nagpur",
        state="Maharashtra",
        latitude=21.1458,
        longitude=79.0882,
        role="buyer",
        is_verified=True
    )
    user_buyer2 = User(
        company_name="GreenPolymer Recyclers",
        email="greenpoly@waste2wealth.ai",
        hashed_password=get_password_hash("password123"),
        gst_number="33DDDDD34564Z8",
        industry_type="Polymer & Rubber Recycling",
        address="SIPCOT Industrial Park",
        city="Chennai",
        state="Tamil Nadu",
        latitude=13.0827,
        longitude=80.2707,
        role="buyer",
        is_verified=True
    )

    user_admin = User(
        company_name="Waste2Wealth Platform Administrator",
        email="admin@waste2wealth.ai",
        hashed_password=get_password_hash("admin123"),
        gst_number="07GOVT000001Z0",
        industry_type="Regulatory & Platform Admin",
        address="Ministry of MSME Hub",
        city="New Delhi",
        state="Delhi",
        latitude=28.6139,
        longitude=77.2090,
        role="admin",
        is_verified=True
    )

    db.add_all([user_gen1, user_gen2, user_buyer1, user_buyer2, user_admin])
    db.commit()

    print("[SEED] Seeding Waste Listings...")
    sample_listings = [
        {
            "user_id": user_gen1.id,
            "waste_name": "High-Grade Blast Furnace Steel Slag",
            "category": "Metals",
            "material_type": "Ferrous Slag & Iron Scrap",
            "description": "High-density blast furnace slag suitable for cement blending, road sub-base, and ballast aggregate. Screened to 10-40mm size.",
            "quantity": 250.0,
            "unit": "tons",
            "quality_grade": "Grade A",
            "moisture_percentage": 2.5,
            "hazardous": False,
            "images": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
            "price": 3200.0,
            "availability": "Immediate",
            "pickup_location": "Pune, Maharashtra",
            "latitude": 18.5204,
            "longitude": 73.8567
        },
        {
            "user_id": user_gen1.id,
            "waste_name": "Thermal Power Plant Class-F Fly Ash",
            "category": "Fly Ash",
            "material_type": "Silica Fly Ash Dust",
            "description": "Dry fine fly ash meeting BIS IS 3812 specifications. Low unburnt carbon (<2.0%). Ideal for PPC cement and eco-friendly bricks.",
            "quantity": 500.0,
            "unit": "tons",
            "quality_grade": "Grade A",
            "moisture_percentage": 1.0,
            "hazardous": False,
            "images": "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80",
            "price": 1150.0,
            "availability": "Immediate",
            "pickup_location": "Pune, Maharashtra",
            "latitude": 18.5204,
            "longitude": 73.8567
        },
        {
            "user_id": user_gen2.id,
            "waste_name": "Post-Industrial HDPE Washed Plastic Flakes",
            "category": "Plastics",
            "material_type": "High-Density Polyethylene Flakes",
            "description": "Cleaned, hot-washed HDPE drum flakes (blue & white mix). Free from oil contamination and ready for extrusion/pelletization.",
            "quantity": 45.0,
            "unit": "tons",
            "quality_grade": "Grade A",
            "moisture_percentage": 0.8,
            "hazardous": False,
            "images": "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80",
            "price": 43500.0,
            "availability": "Immediate",
            "pickup_location": "Vadodara, Gujarat",
            "latitude": 22.3072,
            "longitude": 73.1812
        },
        {
            "user_id": user_gen2.id,
            "waste_name": "Neutralized Organic Chemical Sludge",
            "category": "Chemicals",
            "material_type": "ETP Sludge / Organic Cake",
            "description": "Dewatered ETP sludge cake with high calorific value. Suitable for co-processing in cement kilns as alternative raw fuel.",
            "quantity": 80.0,
            "unit": "tons",
            "quality_grade": "Grade B",
            "moisture_percentage": 18.0,
            "hazardous": True,
            "images": "https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=800&q=80",
            "price": 14200.0,
            "availability": "Within 5 days",
            "pickup_location": "Vadodara, Gujarat",
            "latitude": 22.3072,
            "longitude": 73.1812
        },
        {
            "user_id": user_gen1.id,
            "waste_name": "Sorted Shredded Cotton Textile Fiber",
            "category": "Textiles",
            "material_type": "100% Combed Cotton Scrap",
            "description": "Clean industrial cotton trimmings and spinning waste. Ideal for acoustic insulation panels, geotextiles, and recycled yarn.",
            "quantity": 30.0,
            "unit": "tons",
            "quality_grade": "Grade A",
            "moisture_percentage": 4.0,
            "hazardous": False,
            "images": "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80",
            "price": 16800.0,
            "availability": "Immediate",
            "pickup_location": "Pune, Maharashtra",
            "latitude": 18.5204,
            "longitude": 73.8567
        },
        {
            "user_id": user_gen2.id,
            "waste_name": "Sugarcane Bagasse Agro Biomass Pellets",
            "category": "Organic",
            "material_type": "Biomass Fiber / Bagasse",
            "description": "High GCV sugarcane bagasse compressed briquettes for industrial boiler firing and power generation.",
            "quantity": 120.0,
            "unit": "tons",
            "quality_grade": "Grade A",
            "moisture_percentage": 8.0,
            "hazardous": False,
            "images": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
            "price": 4900.0,
            "availability": "Immediate",
            "pickup_location": "Vadodara, Gujarat",
            "latitude": 22.3072,
            "longitude": 73.1812
        }
    ]

    for item in sample_listings:
        c_stats = calculate_carbon_impact(item["category"], item["quantity"])
        w = WasteListing(
            user_id=item["user_id"],
            waste_name=item["waste_name"],
            category=item["category"],
            material_type=item["material_type"],
            description=item["description"],
            quantity=item["quantity"],
            unit=item["unit"],
            quality_grade=item["quality_grade"],
            moisture_percentage=item["moisture_percentage"],
            hazardous=item["hazardous"],
            images=item["images"],
            price=item["price"],
            availability=item["availability"],
            pickup_location=item["pickup_location"],
            latitude=item["latitude"],
            longitude=item["longitude"],
            status="active",
            views=142,
            carbon_offset_per_unit=round(c_stats["co2_saved_kg"] / item["quantity"], 1)
        )
        db.add(w)

    db.commit()

    print("[SEED] Seeding Sample Transaction & Carbon Records...")
    first_listing = db.query(WasteListing).first()
    if first_listing:
        tx = Transaction(
            waste_id=first_listing.id,
            seller_id=user_gen1.id,
            buyer_id=user_buyer1.id,
            quantity=50.0,
            total_price=160000.0,
            carbon_saved_kg=110000.0,
            status="completed"
        )
        db.add(tx)

        cs = CarbonSaving(
            user_id=user_buyer1.id,
            co2_saved_kg=110000.0,
            trees_equivalent=5000.0,
            energy_saved_kwh=60000.0,
            landfill_reduction_m3=71.4
        )
        db.add(cs)

    print("[SEED] Seeding Notifications...")
    db.add(Notification(
        user_id=user_gen1.id,
        title="AI Buyer Match Found",
        message="EcoCement India requested a quote for 250 tons of Blast Furnace Steel Slag (94.5% compatibility score).",
        type="match"
    ))
    db.add(Notification(
        user_id=user_buyer1.id,
        title="Transaction Completed",
        message="Order #TX-8820 for 50 tons of Steel Slag confirmed. Carbon offset certificates generated.",
        type="order"
    ))

    db.commit()
    db.close()
    print("[SUCCESS] Waste2Wealth Database Seeded Successfully!")

if __name__ == "__main__":
    seed_database()
