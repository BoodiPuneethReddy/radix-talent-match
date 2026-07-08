from fastapi import APIRouter, File, HTTPException, UploadFile

router = APIRouter()


@router.post("/analyze")
def resume_parser_placeholder(file: UploadFile = File(...)):
    raise HTTPException(status_code=501, detail="This module will be implemented by Team Member.")
