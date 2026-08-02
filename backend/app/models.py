import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    gst_number = Column(String, nullable=True)
    industry_type = Column(String, nullable=False)
    address = Column(String, nullable=True)
    state = Column(String, nullable=True)
    city = Column(String, nullable=True)
    latitude = Column(Float, default=20.5937)
    longitude = Column(Float, default=78.9629)
    role = Column(String, default="generator")  # generator, buyer, admin
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    listings = relationship("WasteListing", back_populates="owner")
    orders = relationship("Transaction", foreign_keys="Transaction.buyer_id", back_populates="buyer")
    sales = relationship("Transaction", foreign_keys="Transaction.seller_id", back_populates="seller")


class WasteListing(Base):
    __tablename__ = "waste_listings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    waste_name = Column(String, index=True, nullable=False)
    category = Column(String, index=True, nullable=False)  # Metals, Plastics, Chemicals, Organic, Fly Ash, E-waste, Textiles, Rubber
    material_type = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    quantity = Column(Float, nullable=False)
    unit = Column(String, default="tons")  # tons, kg, barrels, metric_tons
    quality_grade = Column(String, default="Grade A")  # Grade A, Grade B, Grade C, Industrial Scrap
    moisture_percentage = Column(Float, default=5.0)
    hazardous = Column(Boolean, default=False)
    images = Column(Text, nullable=True)  # JSON or comma-separated URLs
    price = Column(Float, nullable=False)  # price per unit in INR
    availability = Column(String, default="Immediate")
    pickup_location = Column(String, nullable=True)
    latitude = Column(Float, default=20.5937)
    longitude = Column(Float, default=78.9629)
    status = Column(String, default="active")  # active, pending, sold, archived
    views = Column(Integer, default=0)
    carbon_offset_per_unit = Column(Float, default=1.8)  # kg CO2 saved per unit
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="listings")
    requests = relationship("BuyerRequest", back_populates="waste")
    transactions = relationship("Transaction", back_populates="waste")


class BuyerRequest(Base):
    __tablename__ = "buyer_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    waste_id = Column(Integer, ForeignKey("waste_listings.id"), nullable=False)
    requested_quantity = Column(Float, nullable=False)
    offered_price = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
    status = Column(String, default="pending")  # pending, accepted, rejected
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    waste = relationship("WasteListing", back_populates="requests")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    waste_id = Column(Integer, ForeignKey("waste_listings.id"), nullable=False)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    carbon_saved_kg = Column(Float, default=0.0)
    status = Column(String, default="completed")  # pending, completed, cancelled
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    waste = relationship("WasteListing", back_populates="transactions")
    seller = relationship("User", foreign_keys=[seller_id], back_populates="sales")
    buyer = relationship("User", foreign_keys=[buyer_id], back_populates="orders")


class CarbonSaving(Base):
    __tablename__ = "carbon_savings"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    co2_saved_kg = Column(Float, nullable=False)
    trees_equivalent = Column(Float, nullable=False)
    energy_saved_kwh = Column(Float, nullable=False)
    landfill_reduction_m3 = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    waste_id = Column(Integer, ForeignKey("waste_listings.id"), nullable=True)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="info")  # info, match, order, system
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
