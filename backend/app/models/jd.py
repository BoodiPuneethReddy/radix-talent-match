from __future__ import annotations

from pydantic import BaseModel, Field


class JDAnalysisModel(BaseModel):
    company: str = ""
    role: str = ""
    required_skills: list[str] = Field(default_factory=list)
    responsibilities: list[str] = Field(default_factory=list)
    experience: str = ""
    technologies: list[str] = Field(default_factory=list)
    categories: dict[str, list[str]] = Field(default_factory=dict)
    source_file_name: str = ""
    analyzed_at: str = ""
