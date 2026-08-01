from pydantic import BaseModel
from typing import Optional, Any


class ErrorDetails(BaseModel):
    code: Optional[str] = ""
    message: str
    timetaken: Optional[str] = ""
    type: Optional[str] = ""
    raw_message: Optional[str] = ""



