from pydantic import BaseModel, EmailStr, Field


class ProfileModel(BaseModel):
    name: str = ""
    email: EmailStr | str = ""
    phone: str = ""
    location: str = ""
    education: str = ""
    skills: list[str] = Field(default_factory=list)
    projects: list[str] = Field(default_factory=list)
    experience: list[str] = Field(default_factory=list)
    hackathons: list[str] = Field(default_factory=list)
    internships: list[str] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)
    achievements: list[str] = Field(default_factory=list)
    preferredRoles: list[str] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=list)
    github: str = ""
    linkedin: str = ""
    portfolio: str = ""
    profilePhotoName: str = ""
    resumeFileName: str = ""
