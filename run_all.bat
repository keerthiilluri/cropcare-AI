@echo off
echo ========================================================
echo Launching CropCare AI (Backend + Frontend)
echo ========================================================
start "CropCare AI - Backend (Port 8000)" cmd /k "run_backend.bat"
timeout /t 3 /nobreak >nul
start "CropCare AI - Frontend (Port 5173)" cmd /k "run_frontend.bat"
echo CropCare AI services are starting!
echo Backend API Docs: http://localhost:8000/docs
echo Frontend Web App: http://localhost:5173
pause
