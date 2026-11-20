import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, EmailStr, Field

# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    village: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    role: Optional[str] = "farmer"

class UserLogin(BaseModel):
    username: str
    password: str

class FarmerProfileSchema(BaseModel):
    farm_size_acres: Optional[float] = 2.0
    primary_crops: Optional[str] = "Tomato, Rice, Potato"
    soil_type: Optional[str] = "Loamy Soil"
    irrigation_source: Optional[str] = "Borewell / Drip"
    experience_years: Optional[int] = 5

    class Config:
        from_attributes = True

class UserResponse(UserBase):
    id: int
    role: str
    created_at: datetime.datetime
    profile: Optional[FarmerProfileSchema] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# AI Prediction & Detection Schemas
class PredictionAlternative(BaseModel):
    crop: str
    disease: str
    confidence: float
    is_healthy: bool

class PredictionResponse(BaseModel):
    success: bool
    is_reliable: bool
    crop_name: str
    predicted_disease: str
    scientific_name: Optional[str] = None
    confidence_score: float  # 0.0 to 1.0
    confidence_percentage: float  # e.g. 94.2
    is_healthy: bool
    status_label: str  # "Healthy" or "Potentially Diseased"
    message: str
    top_alternatives: List[PredictionAlternative] = []
    image_url: str
    detection_id: Optional[int] = None
    disease_info: Optional[Any] = None
    factors_affecting_accuracy: List[str] = [
        "Camera resolution & sharp focus on leaf lesions",
        "Uniform natural daylight without heavy harsh shadows or intense glare",
        "Isolated single leaf or close-up infected leaf region",
        "Clean background free of unrelated foliage, soil, hands, or debris"
    ]

class DetectionHistoryResponse(BaseModel):
    id: int
    crop_name: str
    predicted_disease: str
    confidence_score: float
    is_healthy: bool
    image_path: str
    model_version: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# Disease Reports Schemas
class DiseaseReportCreate(BaseModel):
    reporter_name: str
    contact_number: Optional[str] = None
    crop_name: str
    suspected_disease: Optional[str] = None
    village: str
    district: str
    state: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    symptoms_description: str

class StatusHistoryItem(BaseModel):
    id: int
    status: str
    notes: Optional[str] = None
    changed_by_name: str
    changed_at: datetime.datetime

    class Config:
        from_attributes = True

class DiseaseReportResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    reporter_name: str
    contact_number: Optional[str] = None
    crop_name: str
    suspected_disease: Optional[str] = None
    village: str
    district: str
    state: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    symptoms_description: str
    status: str
    image_path: Optional[str] = None
    admin_notes: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime
    status_history: List[StatusHistoryItem] = []

    class Config:
        from_attributes = True

class ReportStatusUpdate(BaseModel):
    status: str  # Submitted, Under Review, Verified, Resolved
    notes: Optional[str] = None


# Disease Info Schemas
class DiseaseInfoResponse(BaseModel):
    id: str
    crop: str
    disease: str
    scientific_name: Optional[str] = None
    category: str
    severity: str
    is_healthy: bool
    description: str
    symptoms: List[str]
    causes: List[str]
    contributing_conditions: List[str]
    immediate_steps: List[str]
    organic_cultural_management: List[str]
    prevention_methods: List[str]
    safe_handling_precautions: List[str]
    when_to_seek_expert: str

    class Config:
        from_attributes = True


# Dashboard Statistics Schemas
class FarmerDashboardStats(BaseModel):
    total_detections: int
    healthy_detections: int
    diseased_detections: int
    total_reports: int
    pending_reports: int
    resolved_reports: int
    recent_detections: List[DetectionHistoryResponse] = []
    recent_reports: List[DiseaseReportResponse] = []

class AdminDashboardStats(BaseModel):
    total_farmers: int
    total_detections: int
    total_reports: int
    reports_submitted: int
    reports_under_review: int
    reports_verified: int
    reports_resolved: int
    crop_breakdown: List[dict]
    disease_breakdown: List[dict]
    district_breakdown: List[dict]
