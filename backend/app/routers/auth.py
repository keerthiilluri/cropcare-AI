from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, FarmerProfile
from ..schemas import UserCreate, UserLogin, UserResponse, TokenResponse, FarmerProfileSchema
from ..auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if username or email already exists
    existing_user = db.query(User).filter(
        (User.username == user_in.username) | (User.email == user_in.email)
    ).first()
    if existing_user:
        if existing_user.username == user_in.username:
            raise HTTPException(status_code=400, detail="Username already registered")
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        username=user_in.username,
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hash_password(user_in.password),
        role=user_in.role or "farmer",
        phone=user_in.phone,
        state=user_in.state or "Andhra Pradesh",
        district=user_in.district or "Krishna",
        village=user_in.village or "Gannavaram"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create associated default farmer profile
    profile = FarmerProfile(user_id=new_user.id)
    db.add(profile)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": str(new_user.id), "role": new_user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user
    }

@router.post("/login", response_model=TokenResponse)
def login(creds: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.username == creds.username) | (User.email == creds.username)
    ).first()
    if not user or not verify_password(creds.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(
    profile_data: FarmerProfileSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        profile = FarmerProfile(user_id=current_user.id)
        db.add(profile)
    
    profile.farm_size_acres = profile_data.farm_size_acres
    profile.primary_crops = profile_data.primary_crops
    profile.soil_type = profile_data.soil_type
    profile.irrigation_source = profile_data.irrigation_source
    profile.experience_years = profile_data.experience_years

    db.commit()
    db.refresh(current_user)
    return current_user
