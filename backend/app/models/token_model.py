from typing import List, Optional, Generic, TypeVar
from pydantic import BaseModel
from    app.models.error_response import ErrorDetails

class TokenResponse(BaseModel):
    token: str
