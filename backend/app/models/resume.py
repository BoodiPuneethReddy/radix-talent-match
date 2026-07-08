from __future__ import annotations

from pydantic import BaseModel, Field


class ParsedCandidateModel(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    education: list[str] = Field(default_factory=list)
    projects: list[str] = Field(default_factory=list)
    experience: list[str] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    hackathons: list[str] = Field(default_factory=list)
    internships: list[str] = Field(default_factory=list)
    achievements: list[str] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=list)
    github: str = ""
    linkedin: str = ""
    portfolio: str = ""
    source: dict[str, str] = Field(default_factory=dict)
