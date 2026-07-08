from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/talent-check", tags=["talent_check"])


@router.get("/status")
def talent_check_status():
    raise HTTPException(status_code=501, detail="Talent Check module is under development.")
