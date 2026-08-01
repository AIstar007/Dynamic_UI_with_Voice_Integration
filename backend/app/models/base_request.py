from typing import Generic, TypeVar, Optional, Dict, Any
from pydantic import BaseModel

ReqT = TypeVar("ReqT", bound=BaseModel)

class HttpRequest(BaseModel, Generic[ReqT]):
    endpoint: str
    method: str = "GET"
    payload: Optional[ReqT] = None
    headers: Optional[Dict[str, str]] = None
    query_params: Optional[Dict[str, Any]] = None