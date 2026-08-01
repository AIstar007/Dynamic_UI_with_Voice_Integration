"""create Sell Trip model"""

from typing import List, Optional
from pydantic import BaseModel


class Key(BaseModel):
    """Key Model"""

    journeyKey: str
    fareAvailabilityKey: str
    inventoryControl: str = "HoldSpace"


class PassengerType(BaseModel):
    """PassengerType model"""

    type: str
    count: int


class PassengerDetails(BaseModel):
    """PassengerDetails model"""

    types: List[PassengerType]
    residentCountry: Optional[str] = None


class BookFlightRequest(BaseModel):
    """BookFlightRequest Model"""

    keys: List[Key]
    passengers: PassengerDetails
    currencyCode: str
    promotionCode: Optional[str] = None

