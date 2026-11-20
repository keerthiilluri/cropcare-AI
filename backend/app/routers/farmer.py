from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, DiseaseDetection, DiseaseReport
from ..schemas import FarmerDashboardStats
from ..auth import get_current_user

router = APIRouter(prefix="/farmer", tags=["Farmer Dashboard"])

@router.get("/dashboard", response_model=FarmerDashboardStats)
def get_farmer_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_detections = db.query(DiseaseDetection).filter(DiseaseDetection.user_id == current_user.id).count()
    healthy_detections = db.query(DiseaseDetection).filter(
        DiseaseDetection.user_id == current_user.id,
        DiseaseDetection.is_healthy == True
    ).count()
    diseased_detections = total_detections - healthy_detections

    total_reports = db.query(DiseaseReport).filter(DiseaseReport.user_id == current_user.id).count()
    pending_reports = db.query(DiseaseReport).filter(
        DiseaseReport.user_id == current_user.id,
        DiseaseReport.status.in_(["Submitted", "Under Review"])
    ).count()
    resolved_reports = db.query(DiseaseReport).filter(
        DiseaseReport.user_id == current_user.id,
        DiseaseReport.status == "Resolved"
    ).count()

    recent_detections = db.query(DiseaseDetection).filter(
        DiseaseDetection.user_id == current_user.id
    ).order_by(DiseaseDetection.created_at.desc()).limit(5).all()

    recent_reports = db.query(DiseaseReport).filter(
        DiseaseReport.user_id == current_user.id
    ).order_by(DiseaseReport.created_at.desc()).limit(5).all()

    return FarmerDashboardStats(
        total_detections=total_detections,
        healthy_detections=healthy_detections,
        diseased_detections=diseased_detections,
        total_reports=total_reports,
        pending_reports=pending_reports,
        resolved_reports=resolved_reports,
        recent_detections=recent_detections,
        recent_reports=recent_reports
    )
