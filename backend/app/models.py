import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="farmer")  # "farmer" or "admin"
    phone = Column(String(20), nullable=True)
    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    village = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    profile = relationship("FarmerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    detections = relationship("DiseaseDetection", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("DiseaseReport", back_populates="user", cascade="all, delete-orphan")


class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    farm_size_acres = Column(Float, default=2.0)
    primary_crops = Column(String(255), default="Tomato, Rice, Potato")
    soil_type = Column(String(100), default="Loamy Soil")
    irrigation_source = Column(String(100), default="Borewell / Drip")
    experience_years = Column(Integer, default=5)

    user = relationship("User", back_populates="profile")


class DiseaseDetection(Base):
    __tablename__ = "disease_detections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    crop_name = Column(String(100), nullable=False)
    predicted_disease = Column(String(150), nullable=False)
    confidence_score = Column(Float, nullable=False)
    is_healthy = Column(Boolean, default=False)
    top_alternatives = Column(Text, nullable=True)  # JSON string of alternative predictions
    image_path = Column(String(255), nullable=False)
    model_version = Column(String(50), default="MobileNetV2-PlantVillage-v1")
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    user = relationship("User", back_populates="detections")


class DiseaseReport(Base):
    __tablename__ = "disease_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    reporter_name = Column(String(100), nullable=False)
    contact_number = Column(String(25), nullable=True)
    crop_name = Column(String(100), nullable=False)
    suspected_disease = Column(String(150), nullable=True)
    village = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    symptoms_description = Column(Text, nullable=False)
    status = Column(String(50), default="Submitted", index=True)  # Submitted, Under Review, Verified, Resolved
    image_path = Column(String(255), nullable=True)
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="reports")
    status_history = relationship("ReportStatusHistory", back_populates="report", cascade="all, delete-orphan")


class ReportStatusHistory(Base):
    __tablename__ = "report_status_history"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("disease_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), nullable=False)
    notes = Column(Text, nullable=True)
    changed_by_name = Column(String(100), default="System")
    changed_at = Column(DateTime, default=datetime.datetime.utcnow)

    report = relationship("DiseaseReport", back_populates="status_history")


class DiseaseInfo(Base):
    __tablename__ = "disease_info"

    id = Column(String(100), primary_key=True, index=True)  # e.g. tomato_early_blight
    crop = Column(String(100), nullable=False, index=True)
    disease = Column(String(150), nullable=False, index=True)
    scientific_name = Column(String(150), nullable=True)
    category = Column(String(100), default="Fungal")
    severity = Column(String(50), default="Moderate")
    is_healthy = Column(Boolean, default=False)
    description = Column(Text, nullable=False)
    symptoms = Column(Text, nullable=False)  # JSON string
    causes = Column(Text, nullable=False)     # JSON string
    contributing_conditions = Column(Text, nullable=False)  # JSON string
    immediate_steps = Column(Text, nullable=False)          # JSON string
    organic_cultural_management = Column(Text, nullable=False)  # JSON string
    prevention_methods = Column(Text, nullable=False)       # JSON string
    safe_handling_precautions = Column(Text, nullable=False) # JSON string
    when_to_seek_expert = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
