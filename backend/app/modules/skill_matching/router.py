from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.get("/")
def skill_matching_placeholder():
    raise HTTPException(status_code=501, detail="This module will be implemented by Team Member.")
