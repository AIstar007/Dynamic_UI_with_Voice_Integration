from pydantic import BaseModel, ConfigDict, field_validator, model_validator
from typing import Any, List, Optional
from datetime import datetime


# DESIGNATOR
class Designator(BaseModel):
    origin: str
    destination: str
    departure: datetime
    arrival: datetime


# LEG INFO
class LegInfo(BaseModel):
    departureTerminal: Optional[str] = None
    arrivalTerminal: Optional[str] = None


class Leg(BaseModel):
    legKey: str
    legInfo: LegInfo

class Identifier(BaseModel):
    identifier: Optional[str] = None
    carrierCode: Optional[str] = None

    
# SEGMENT
class Segment(BaseModel):
    identifier: Identifier
    carrierCode: Optional[str] = None
    designator: Designator
    legs: List[LegInfo]

    @model_validator(mode="before")
    @classmethod
    def normalize_identifier_object(cls, value: Any) -> Any:
        if not isinstance(value, dict):
            return value

        identifier_value = value.get("identifier")
        if not isinstance(identifier_value, dict):
            return value

        normalized = dict(value)

        carrier_code = identifier_value.get("carrierCode")
        if not normalized.get("carrierCode") and isinstance(carrier_code, str):
            normalized["carrierCode"] = carrier_code

        identifier_text = identifier_value.get("identifier")
        normalized["identifier"] = str(identifier_text) if identifier_text is not None else None

        return normalized


# JOURNEY
class Journey(BaseModel):
    journeyKey: str
    flightType: int
    stops: int
    designator: Designator
    segments: List[Segment]


class JourneyMarket(BaseModel):
    flights: List[Journey]


# TRIPS
class Trip(BaseModel):
    date: datetime
    multipleOriginStations: Optional[bool] = None
    multipleDestinationStations: Optional[bool] = None
    journeysAvailableByMarket: List[JourneyMarket]

    @field_validator("journeysAvailableByMarket", mode="before")
    @classmethod
    def normalize_journeys_by_market(cls, value: Any) -> Any:
        if not isinstance(value, dict):
            return value

        normalized: List[dict[str, Any]] = []
        for market_key, market_value in value.items():
            if isinstance(market_value, list):
                normalized.append({"marketKey": market_key, "flights": market_value})
                continue

            if isinstance(market_value, dict):
                market_dict = dict(market_value)
                market_dict.setdefault("marketKey", market_key)
                if "flights" in market_dict and isinstance(market_dict["flights"], list):
                    normalized.append(market_dict)

        return normalized


# SERVICE CHARGE
class ServiceCharge(BaseModel):
    amount: float
    code: Optional[str] = None
    type: Optional[int] = None
    collectType: Optional[int] = None
    currencyCode: Optional[str] = None
    foreignCurrencyCode: Optional[str] = None
    foreignAmount: Optional[float] = None
    ticketCode: Optional[str] = None


# PASSENGER FARE
class PassengerFare(BaseModel):
    fareDiscountCode: Optional[str] = None
    passengerDiscountCode: Optional[str] = None
    passengerType: str
    fareAmount: float
    revenueFare: float
    publishedFare: float
    loyaltyPoints: Optional[int] = 0
    discountedFare: float
    serviceCharges: List[ServiceCharge]
    multiplier: Optional[int] = None
    ticketFareBasis: Optional[str] = None


# FARE DETAILS
class FareDetail(BaseModel):
    isGoverning: Optional[bool] = True
    fareBasisCode: str
    classOfService: str
    classType: Optional[str] = None
    fareApplicationType: Optional[int] = None
    fareStatus: Optional[int] = None
    productClass: Optional[str] = None
    ruleNumber: Optional[str] = None
    ruleTariff: Optional[str] = None
    passengerFares: List[PassengerFare]
    travelClassCode: Optional[str] = None
    isAllotmentMarketFare: Optional[bool] = None
    reference: Optional[str] = None


# TOTALS
class FareTotals(BaseModel):
    fareTotal: float
    revenueTotal: float
    publishedTotal: float
    loyaltyTotal: Optional[float] = 0
    discountedTotal: float
    isSumOfSector: Optional[bool] = None


# FARE AVAILABILITY (KEY LEVEL)
class FareAvailability(BaseModel):
    fareAvailabilityKey: str
    totals: FareTotals
    fares: List[FareDetail]


# Response Models
class Data(BaseModel):
    results: List[dict[str, Any]]
    faresAvailable: Optional[dict[str, Any]] = None
    currencyCode: Optional[str] = None

    model_config = ConfigDict(extra="allow")

class FlightSearchResponse(Data):

    @model_validator(mode="before")
    @classmethod
    def normalize_response_shape(cls, value: Any) -> Any:
        if isinstance(value, dict) and isinstance(value.get("data"), dict):
            return value["data"]
        return value
