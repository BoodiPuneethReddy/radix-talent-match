from fastapi import APIRouter, File, HTTPException, UploadFile

router = APIRouter(prefix="/resume", tags=["resume_parser"])


@router.post("/analyze")
def analyze_resume(file: UploadFile = File(...)):
    _ = file.filename
    raise HTTPException(status_code=501, detail="This module will be implemented by Team Member.")
