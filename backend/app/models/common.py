from typing import Any

from pydantic import BaseModel


class ApiResponse(BaseModel):
    message: str
    data: Any | None = None
