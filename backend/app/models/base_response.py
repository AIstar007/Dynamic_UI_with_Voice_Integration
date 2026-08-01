from typing import List, Optional, Generic, TypeVar
from pydantic import BaseModel
from app.models.error_response import ErrorDetails

T = TypeVar("T")  # Generic data type for success responses


class BaseResponse(BaseModel, Generic[T]):
    status_code: int = 200
    data: Optional[T] = None
    errors: Optional[List[ErrorDetails]] = None

