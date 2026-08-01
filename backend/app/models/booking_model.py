"""Navitaire booking model"""

from typing import Dict, Optional, List
from pydantic import BaseModel, Field
from datetime import datetime


class PassengerName(BaseModel):
    first: str
    last: str
    title: str


class PassengerResponse(BaseModel):
    passengerKey: str
    name: Optional[PassengerName]
    passengerTypeCode: str


class Breakdown(BaseModel):
    balanceDue: float


class TripDesignator(BaseModel):
    destination: str
    origin: str
    arrival: datetime
    departure: datetime


class Identifier(BaseModel):
    identifier: str
    carrierCode: str


class LegInfo(BaseModel):
    arrivalTerminal: Optional[str]
    departureTerminal: Optional[str]


class Leg(BaseModel):
    legInfo: LegInfo
    designator: TripDesignator


class Segment(BaseModel):
    designator: TripDesignator
    identifier: Identifier
    legs: List[Leg]
    flightNumber: Optional[str] = None
    
    def duration(self) -> str:
        if self.designator and self.designator.arrival and self.designator.departure:
            duration = self.designator.arrival - self.designator.departure
            hours, remainder = divmod(duration.total_seconds(), 3600)
            minutes, _ = divmod(remainder, 60)
            return f"{int(hours):02}:{int(minutes):02}"
        return "00:00"

class Journey(BaseModel):
    flightType: int
    designator: TripDesignator
    journeyKey: str
    segments: List[Segment]
    categoryFare: Optional[str] = Field(default=None)
    totalFarePrice: Optional[float] = Field(default=None)

class BookingResponse(BaseModel):
    """Booking Model"""

    token: Optional[str] = None
    passengers: Dict[str, PassengerResponse]
    breakdown: Breakdown
    journeys: List[Journey]

