from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.get("/")
def talent_check_placeholder():
    raise HTTPException(status_code=501, detail="This module will be implemented by Team Member.")
