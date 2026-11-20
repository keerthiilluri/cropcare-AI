import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import User, DiseaseReport, DiseaseDetection, ReportStatusHistory
from ..schemas import DiseaseReportResponse, ReportStatusUpdate, UserResponse
from ..auth import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

@router.get("/stats")
def get_admin_dashboard_stats(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total_farmers = db.query(User).filter(User.role == "farmer").count()
    total_detections = db.query(DiseaseDetection).count()
    total_reports = db.query(DiseaseReport).count()

    # Status counts
    status_counts = db.query(
        DiseaseReport.status, func.count(DiseaseReport.id)
    ).group_by(DiseaseReport.status).all()
    status_dict = {s[0]: s[1] for s in status_counts}

    # Crop breakdown from actual detections and reports
    crop_counts = db.query(
        DiseaseReport.crop_name, func.count(DiseaseReport.id)
    ).group_by(DiseaseReport.crop_name).all()

    # District breakdown
    district_counts = db.query(
        DiseaseReport.district, func.count(DiseaseReport.id)
    ).group_by(DiseaseReport.district).all()

    # Disease breakdown
    disease_counts = db.query(
        DiseaseReport.suspected_disease, func.count(DiseaseReport.id)
    ).group_by(DiseaseReport.suspected_disease).all()

    return {
        "total_farmers": total_farmers,
        "total_detections": total_detections,
        "total_reports": total_reports,
        "reports_submitted": status_dict.get("Submitted", 0),
        "reports_under_review": status_dict.get("Under Review", 0),
        "reports_verified": status_dict.get("Verified", 0),
        "reports_resolved": status_dict.get("Resolved", 0),
        "crop_breakdown": [{"crop": c[0], "count": c[1]} for c in crop_counts],
        "district_breakdown": [{"district": d[0], "count": d[1]} for d in district_counts],
        "disease_breakdown": [{"disease": d[0], "count": d[1]} for d in disease_counts]
    }

@router.get("/farmers", response_model=List[UserResponse])
def get_all_farmers(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    farmers = db.query(User).filter(User.role == "farmer").order_by(User.created_at.desc()).all()
    return farmers

@router.get("/reports", response_model=List[DiseaseReportResponse])
def get_all_reports(
    admin: User = Depends(get_current_admin),
    crop: Optional[str] = Query(None),
    disease: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(DiseaseReport)
    if crop:
        query = query.filter(DiseaseReport.crop_name.ilike(f"%{crop}%"))
    if disease:
        query = query.filter(DiseaseReport.suspected_disease.ilike(f"%{disease}%"))
    if district:
        query = query.filter(DiseaseReport.district.ilike(f"%{district}%"))
    if status:
        query = query.filter(DiseaseReport.status == status)
    
    reports = query.order_by(DiseaseReport.created_at.desc()).all()
    return reports

@router.put("/reports/{id}/status", response_model=DiseaseReportResponse)
def update_report_status(
    id: int,
    update_data: ReportStatusUpdate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    report = db.query(DiseaseReport).filter(DiseaseReport.id == id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    valid_statuses = {"Submitted", "Under Review", "Verified", "Resolved"}
    if update_data.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Choose from {valid_statuses}")

    report.status = update_data.status
    if update_data.notes:
        report.admin_notes = update_data.notes

    # Add to status history
    history_entry = ReportStatusHistory(
        report_id=report.id,
        status=update_data.status,
        notes=update_data.notes,
        changed_by_name=f"Admin ({admin.full_name})"
    )
    db.add(history_entry)
    db.commit()
    db.refresh(report)

    return report

@router.get("/detections")
def get_recent_system_detections(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    detections = db.query(DiseaseDetection).order_by(DiseaseDetection.created_at.desc()).limit(50).all()
    return [
        {
            "id": d.id,
            "crop": d.crop_name,
            "disease": d.predicted_disease,
            "confidence": round(d.confidence_score * 100, 1),
            "is_healthy": d.is_healthy,
            "image_url": d.image_path,
            "date": d.created_at.strftime("%Y-%m-%d %H:%M"),
            "farmer_id": d.user_id
        } for d in detections
    ]
