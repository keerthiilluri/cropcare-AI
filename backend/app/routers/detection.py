import os
import uuid
import json
import shutil
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, DiseaseDetection
from ..schemas import PredictionResponse, DetectionHistoryResponse
from ..auth import get_optional_current_user, get_current_user
from ..ml_service import ml_service
from ..config import settings

router = APIRouter(prefix="/detection", tags=["AI Disease Detection"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
MAX_FILE_SIZE = 15 * 1024 * 1024  # 15 MB

@router.post("/detect", response_model=PredictionResponse)
async def detect_crop_disease(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    # 1. Validate file extension
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file format '{ext}'. Supported formats are JPG, JPEG, and PNG."
        )

    # 2. Save uploaded image to safe directory
    upload_dir = settings.UPLOAD_DIR / "detections"
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    unique_filename = f"{uuid.uuid4().hex[:12]}_{file.filename}"
    saved_path = upload_dir / unique_filename

    # Read and validate size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the 15 MB limit. Please upload a smaller image."
        )
    if len(contents) < 500:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is too small or corrupt. Please upload a valid photo."
        )

    with open(saved_path, "wb") as f:
        f.write(contents)

    # 3. Perform AI inference
    result = ml_service.predict(str(saved_path))
    image_url = f"/uploads/detections/{unique_filename}"

    # 4. Save detection record if user is logged in
    detection_id = None
    if current_user and result.get("success"):
        detection = DiseaseDetection(
            user_id=current_user.id,
            crop_name=result.get("crop_name", "Unknown"),
            predicted_disease=result.get("predicted_disease", "Unknown"),
            confidence_score=result.get("confidence_score", 0.0),
            is_healthy=result.get("is_healthy", False),
            top_alternatives=json.dumps(result.get("top_alternatives", [])),
            image_path=image_url,
            model_version="MobileNetV2-PlantVillage-v1"
        )
        db.add(detection)
        db.commit()
        db.refresh(detection)
        detection_id = detection.id

    return PredictionResponse(
        success=result.get("success", True),
        is_reliable=result.get("is_reliable", False),
        crop_name=result.get("crop_name", "Unknown"),
        predicted_disease=result.get("predicted_disease", "Unknown"),
        scientific_name=result.get("scientific_name"),
        confidence_score=result.get("confidence_score", 0.0),
        confidence_percentage=result.get("confidence_percentage", 0.0),
        is_healthy=result.get("is_healthy", False),
        status_label=result.get("status_label", "Uncertain"),
        message=result.get("message", ""),
        top_alternatives=result.get("top_alternatives", []),
        image_url=image_url,
        detection_id=detection_id,
        disease_info=result.get("disease_info")
    )

@router.get("/history", response_model=List[DetectionHistoryResponse])
def get_detection_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    detections = db.query(DiseaseDetection).filter(
        DiseaseDetection.user_id == current_user.id
    ).order_by(DiseaseDetection.created_at.desc()).all()
    return detections

@router.delete("/history/{id}")
def delete_detection(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    detection = db.query(DiseaseDetection).filter(
        DiseaseDetection.id == id,
        DiseaseDetection.user_id == current_user.id
    ).first()
    if not detection:
        raise HTTPException(status_code=404, detail="Detection record not found")
    
    db.delete(detection)
    db.commit()
    return {"message": "Detection record successfully deleted"}
