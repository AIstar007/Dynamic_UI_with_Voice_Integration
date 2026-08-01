"""create Contact Details model"""

from typing import List,Optional
from pydantic import BaseModel
from app.models.booking_model import Breakdown, Journey

class PhoneNumber(BaseModel):
    """PhoneNumber model"""
    type: int
    number:Optional[str] = None

class Address(BaseModel):
    """Address model"""
    lineOne: str
    lineTwo: str 
    lineThree: str
    countryCode: str
    provinceState: str
    city: str
    postalCode: str 

class Name(BaseModel):
    """Name model"""
    first: Optional[str] = None
    middle: Optional[str] = None
    last: Optional[str] = None
    title: Optional[str] = None
    suffix: Optional[str] = None
    
class ContactDetailsRequest(BaseModel):
    contactTypeCode: str = "P"
    phoneNumbers: List[PhoneNumber]
    cultureCode: Optional[str] = None
    address: Optional[Address] = None
    emailAddress: str
    customerNumber: Optional[str] = None
    distributionOption:Optional[str] = None
    notificationPreference:Optional[str] = None
    name: Optional[Name] = None


class ContactDetailsRequests(BaseModel):
    """ContactDetailsRequest model"""
    contactDetailsRequests : ContactDetailsRequest
    token: str

class PostedContactDetails(BaseModel):
    phoneNumbers : List[PhoneNumber]
    emailAddress : str

    
# DTO for Contact Details Response

class ContactDetailsRequestDto(BaseModel):
    """DTO for validating contact details request"""

    number: str
    email: str
    contactFirstName: str
    contactLastName: str
    contactTitle: str
    token: str

class PassengerSummary(BaseModel):
    index: int
    name: str


class PaymentLinksDto(BaseModel):
    """DTO for payment links"""
    web: Optional[str] = None
    mobile: Optional[str] = None
    iframe: Optional[str] = None


class PaymentInfoDto(BaseModel):
    """DTO for enhanced payment information"""
    orderStatus: Optional[str] = None
    order_id: Optional[str] = None
    id: Optional[str] = None
    orderAmount: Optional[float] = None
    orderCurrency: Optional[str] = None
    payment_links: Optional[PaymentLinksDto] = None
    sdkPayload: Optional[str] = None


class ContactDetailsResponse(BaseModel):
    passengers: List[PassengerSummary]
    token: str
    breakdown: Breakdown
    journeys: List[Journey]
    paymentInfo: Optional[PaymentInfoDto] = None

