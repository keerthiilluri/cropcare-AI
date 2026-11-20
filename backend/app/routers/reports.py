import os
import uuid
from typing import List, Optional
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import User, DiseaseReport, ReportStatusHistory
from ..schemas import DiseaseReportResponse
from ..auth import get_optional_current_user, get_current_user
from ..config import settings

router = APIRouter(prefix="/reports", tags=["Disease Reports"])

@router.post("", response_model=DiseaseReportResponse)
async def submit_disease_report(
    reporter_name: str = Form(...),
    contact_number: Optional[str] = Form(None),
    crop_name: str = Form(...),
    suspected_disease: Optional[str] = Form(None),
    village: str = Form(...),
    district: str = Form(...),
    state: str = Form(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    symptoms_description: str = Form(...),
    file: Optional[UploadFile] = File(None),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    image_url = None
    if file and file.filename:
        upload_dir = settings.UPLOAD_DIR / "reports"
        upload_dir.mkdir(parents=True, exist_ok=True)
        unique_filename = f"{uuid.uuid4().hex[:12]}_{file.filename}"
        saved_path = upload_dir / unique_filename

        contents = await file.read()
        with open(saved_path, "wb") as f:
            f.write(contents)
        image_url = f"/uploads/reports/{unique_filename}"

    report = DiseaseReport(
        user_id=current_user.id if current_user else None,
        reporter_name=reporter_name,
        contact_number=contact_number,
        crop_name=crop_name,
        suspected_disease=suspected_disease or "Unspecified",
        village=village,
        district=district,
        state=state,
        latitude=latitude,
        longitude=longitude,
        symptoms_description=symptoms_description,
        status="Submitted",
        image_path=image_url
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Add initial status history entry
    history_entry = ReportStatusHistory(
        report_id=report.id,
        status="Submitted",
        notes="Disease report received and logged into community surveillance database.",
        changed_by_name=reporter_name
    )
    db.add(history_entry)
    db.commit()
    db.refresh(report)

    return report

@router.get("/my", response_model=List[DiseaseReportResponse])
def get_my_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reports = db.query(DiseaseReport).filter(
        DiseaseReport.user_id == current_user.id
    ).order_by(DiseaseReport.created_at.desc()).all()
    return reports

@router.get("/outbreaks")
def get_outbreak_summary(db: Session = Depends(get_db)):
    """
    Returns actual disease outbreak metrics aggregated from real database reports.
    """
    total_reports = db.query(DiseaseReport).count()
    
    # Reports by crop
    crop_counts = db.query(
        DiseaseReport.crop_name, func.count(DiseaseReport.id)
    ).group_by(DiseaseReport.crop_name).all()
    
    # Reports by district
    district_counts = db.query(
        DiseaseReport.district, DiseaseReport.state, func.count(DiseaseReport.id)
    ).group_by(DiseaseReport.district, DiseaseReport.state).all()

    # Reports by status
    status_counts = db.query(
        DiseaseReport.status, func.count(DiseaseReport.id)
    ).group_by(DiseaseReport.status).all()

    # Recent verified outbreaks
    recent_reports = db.query(DiseaseReport).order_by(DiseaseReport.created_at.desc()).limit(10).all()

    return {
        "total_active_reports": total_reports,
        "by_crop": [{"crop": c[0], "count": c[1]} for c in crop_counts],
        "by_district": [{"district": d[0], "state": d[1], "count": d[2]} for d in district_counts],
        "by_status": {s[0]: s[1] for s in status_counts},
        "recent_reports": [
            {
                "id": r.id,
                "crop": r.crop_name,
                "disease": r.suspected_disease,
                "location": f"{r.village}, {r.district}, {r.state}",
                "status": r.status,
                "date": r.created_at.strftime("%Y-%m-%d"),
                "latitude": r.latitude,
                "longitude": r.longitude
            } for r in recent_reports
        ]
    }

@router.get("/{id}", response_model=DiseaseReportResponse)
def get_report_detail(id: int, db: Session = Depends(get_db)):
    report = db.query(DiseaseReport).filter(DiseaseReport.id == id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report
