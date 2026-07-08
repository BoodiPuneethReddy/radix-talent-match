from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional


class ExperienceItem(BaseModel):
    title: str = ""
    company: str = ""
    duration: str = ""
    description: str = ""


class ProjectItem(BaseModel):
    name: str = ""
    description: str = ""
    link: str = ""


class EducationItem(BaseModel):
    degree: str = ""
    institution: str = ""
    year: str = ""


class ProfilePayload(BaseModel):
    name: str = ""
    email: Optional[EmailStr] = None
    phone: str = ""
    location: str = ""
    education: List[EducationItem] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    projects: List[ProjectItem] = Field(default_factory=list)
    experience: List[ExperienceItem] = Field(default_factory=list)
    hackathons: List[str] = Field(default_factory=list)
    internships: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    achievements: List[str] = Field(default_factory=list)
    preferred_roles: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    github: str = ""
    linkedin: str = ""
    portfolio: str = ""
    resume_file: str = ""
    profile_photo: str = ""


class ProfileResponse(BaseModel):
    profile: ProfilePayload
    last_updated: str
