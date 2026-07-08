from fastapi import APIRouter

from app.modules.jd_analytics.router import router as jd_analytics_router
from app.modules.resume_parser.router import router as resume_parser_router
from app.modules.profile_builder.router import router as profile_builder_router
from app.modules.talent_check.router import router as talent_check_router
from app.modules.skill_matching.router import router as skill_matching_router

api_router = APIRouter(prefix="/api")
api_router.include_router(jd_analytics_router)
api_router.include_router(resume_parser_router)
api_router.include_router(profile_builder_router)
api_router.include_router(talent_check_router)
api_router.include_router(skill_matching_router)
