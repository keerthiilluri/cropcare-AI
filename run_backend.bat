@echo off
echo ========================================================
echo Starting CropCare AI Backend Server (FastAPI + Uvicorn)
echo ========================================================
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
