from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/jd-analytics", tags=["jd_analytics"])


@router.get("/status")
def jd_analytics_status():
    raise HTTPException(status_code=501, detail="This module will be implemented by Team Member.")
