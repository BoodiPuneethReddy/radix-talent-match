import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict

DATA_FILE = Path(__file__).resolve().parents[1] / "data" / "profile_builder.json"


def _default_data() -> Dict[str, Any]:
    return {
        "profile": {
            "name": "",
            "email": None,
            "phone": "",
            "location": "",
            "education": [],
            "skills": [],
            "projects": [],
            "experience": [],
            "hackathons": [],
            "internships": [],
            "certifications": [],
            "achievements": [],
            "preferred_roles": [],
            "languages": [],
            "github": "",
            "linkedin": "",
            "portfolio": "",
            "resume_file": "",
            "profile_photo": "",
        },
        "last_updated": datetime.now(timezone.utc).isoformat(),
    }


def read_profile_data() -> Dict[str, Any]:
    if not DATA_FILE.exists():
        data = _default_data()
        write_profile_data(data)
        return data
    with DATA_FILE.open("r", encoding="utf-8") as file:
        return json.load(file)


def write_profile_data(data: Dict[str, Any]) -> Dict[str, Any]:
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    data["last_updated"] = datetime.now(timezone.utc).isoformat()
    with DATA_FILE.open("w", encoding="utf-8") as file:
        json.dump(data, file, indent=2)
    return data


def reset_profile_data() -> Dict[str, Any]:
    data = _default_data()
    write_profile_data(data)
    return data
