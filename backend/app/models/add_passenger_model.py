"""Request model for passenger"""

from typing import Optional
from pydantic import BaseModel


class PostInfo(BaseModel):
    nationality: Optional[str] = None
    resident_country: Optional[str] = None
    gender: int


class PostName(BaseModel):

    first: Optional[str] = None
    middle: Optional[str] = None
    last: Optional[str] = None
    title: Optional[str] = None


class AddPassengerRequest(BaseModel):

    name: PostName
    info: PostInfo


class ListPostAddPassenger(BaseModel):
    PassengerList: dict[str, AddPassengerRequest]
    token: str
