import os
import json
import datetime
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import settings
from .database import engine, Base, SessionLocal
from .models import User, FarmerProfile, DiseaseReport, DiseaseDetection, ReportStatusHistory
from .auth import hash_password
from .routers import auth, detection, reports, diseases, admin, farmer

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CropCare AI - Smart Crop Disease Detection & Farmer Assistance API",
    description="End-to-end REST API powering AI-driven crop leaf disease classification, farmer reporting, community outbreak tracking, and agricultural advisory.",
    version=settings.VERSION
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads static directory
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
(settings.UPLOAD_DIR / "detections").mkdir(parents=True, exist_ok=True)
(settings.UPLOAD_DIR / "reports").mkdir(parents=True, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(detection.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(diseases.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(farmer.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def seed_initial_demo_data():
    db = SessionLocal()
    try:
        # 1. Seed Default Admin
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            admin_user = User(
                username="admin",
                email="admin@cropcare.ai",
                full_name="Agricultural Extension Officer",
                hashed_password=hash_password("admin123"),
                role="admin",
                phone="+91 98765 43210",
                state="Andhra Pradesh",
                district="Krishna",
                village="Vijayawada Central"
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print("Seeded default admin user (admin / admin123)")

        # 2. Seed Default Farmer
        farmer_user = db.query(User).filter(User.username == "farmer").first()
        if not farmer_user:
            farmer_user = User(
                username="farmer",
                email="ramesh.farmer@gmail.com",
                full_name="Ramesh Patel",
                hashed_password=hash_password("farmer123"),
                role="farmer",
                phone="+91 94401 23456",
                state="Andhra Pradesh",
                district="Krishna",
                village="Gannavaram"
            )
            db.add(farmer_user)
            db.commit()
            db.refresh(farmer_user)

            profile = FarmerProfile(
                user_id=farmer_user.id,
                farm_size_acres=3.5,
                primary_crops="Tomato, Rice, Potato",
                soil_type="Alluvial Loamy",
                irrigation_source="Canal & Borewell",
                experience_years=12
            )
            db.add(profile)
            db.commit()
            print("Seeded demo farmer user (farmer / farmer123)")

        # 3. Seed Realistic Sample Disease Reports for Immediate Demonstration
        if db.query(DiseaseReport).count() == 0:
            sample_reports = [
                {
                    "reporter_name": "Ramesh Patel",
                    "contact_number": "+91 94401 23456",
                    "crop_name": "Tomato",
                    "suspected_disease": "Early Blight",
                    "village": "Gannavaram",
                    "district": "Krishna",
                    "state": "Andhra Pradesh",
                    "latitude": 16.5417,
                    "longitude": 80.8033,
                    "symptoms_description": "Observed concentric brown rings with yellow halo on lower tomato leaves following heavy morning fog. Approx 15% of plants show initial symptoms.",
                    "status": "Verified",
                    "admin_notes": "Early blight confirmed by extension officer. Advised copper-based protective fungicide and pruning lower foliage.",
                    "user_id": farmer_user.id if farmer_user else None
                },
                {
                    "reporter_name": "Venkatesh Rao",
                    "contact_number": "+91 98480 11223",
                    "crop_name": "Rice (Paddy)",
                    "suspected_disease": "Bacterial Leaf Blight",
                    "village": "Kankipadu",
                    "district": "Krishna",
                    "state": "Andhra Pradesh",
                    "latitude": 16.4258,
                    "longitude": 80.7689,
                    "symptoms_description": "Water-soaked lesions turning yellow along margins of flag leaves. Bacterial droplets visible early morning.",
                    "status": "Under Review",
                    "admin_notes": "Specimen collected for regional KVK laboratory bacterial assay.",
                    "user_id": None
                },
                {
                    "reporter_name": "Suresh Kumar",
                    "contact_number": "+91 99887 76655",
                    "crop_name": "Corn (Maize)",
                    "suspected_disease": "Common Rust",
                    "village": "Nuzvid",
                    "district": "Krishna",
                    "state": "Andhra Pradesh",
                    "latitude": 16.7850,
                    "longitude": 80.8461,
                    "symptoms_description": "Cinnamon-brown powdery pustules covering leaf surfaces on knee-high hybrid corn.",
                    "status": "Resolved",
                    "admin_notes": "Treated with approved fungicide spray. Disease arrested successfully without yield penalty.",
                    "user_id": None
                },
                {
                    "reporter_name": "Lakshmi Devi",
                    "contact_number": "+91 97001 88990",
                    "crop_name": "Potato",
                    "suspected_disease": "Late Blight",
                    "village": "Madanapalle",
                    "district": "Annamayya",
                    "state": "Andhra Pradesh",
                    "latitude": 13.5500,
                    "longitude": 78.5000,
                    "symptoms_description": "Sudden dark water-soaked rot patches on leaves and stems following 3 days of cool continuous rain.",
                    "status": "Submitted",
                    "admin_notes": "Pending urgent field inspection by district horticulture inspector.",
                    "user_id": None
                }
            ]

            for rep_data in sample_reports:
                rep = DiseaseReport(**rep_data)
                db.add(rep)
                db.commit()
                db.refresh(rep)

                hist = ReportStatusHistory(
                    report_id=rep.id,
                    status=rep.status,
                    notes=rep.admin_notes or "Initial report submitted.",
                    changed_by_name="System / Extension Office"
                )
                db.add(hist)
                db.commit()

            print("Seeded realistic community outbreak reports.")

        # 4. Seed initial detections for demo farmer
        if farmer_user and db.query(DiseaseDetection).filter(DiseaseDetection.user_id == farmer_user.id).count() == 0:
            sample_detections = [
                {
                    "user_id": farmer_user.id,
                    "crop_name": "Tomato",
                    "predicted_disease": "Early Blight",
                    "confidence_score": 0.942,
                    "is_healthy": False,
                    "top_alternatives": json.dumps([
                        {"crop": "Potato", "disease": "Early Blight", "confidence": 3.8, "is_healthy": False},
                        {"crop": "Tomato", "disease": "Late Blight", "confidence": 1.2, "is_healthy": False}
                    ]),
                    "image_path": "/uploads/detections/sample_tomato_early_blight.jpg",
                    "model_version": "MobileNetV2-PlantVillage-v1"
                },
                {
                    "user_id": farmer_user.id,
                    "crop_name": "Tomato",
                    "predicted_disease": "Healthy",
                    "confidence_score": 0.978,
                    "is_healthy": True,
                    "top_alternatives": json.dumps([
                        {"crop": "Pepper Bell (Chilli)", "disease": "Healthy", "confidence": 1.4, "is_healthy": True}
                    ]),
                    "image_path": "/uploads/detections/sample_tomato_healthy.jpg",
                    "model_version": "MobileNetV2-PlantVillage-v1"
                }
            ]
            for det in sample_detections:
                db.add(DiseaseDetection(**det))
            db.commit()
            print("Seeded demo detection history records.")

    except Exception as e:
        print(f"Error during startup seeding: {e}")
    finally:
        db.close()

from fastapi.responses import FileResponse

FRONTEND_DIST = settings.BASE_DIR.parent / "frontend" / "dist"
if (FRONTEND_DIST / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

@app.get("/")
def read_root():
    if (FRONTEND_DIST / "index.html").exists():
        return FileResponse(FRONTEND_DIST / "index.html")
    return {
        "project": "CropCare AI",
        "tagline": "Smart Farming, Healthy Crops",
        "status": "operational",
        "api_docs": "/docs",
        "version": settings.VERSION
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "database": "connected",
        "ai_model": "loaded" if (settings.MODEL_PATH.exists()) else "pending"
    }

