"""Payment initiation models for prepayment API"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class PaymentComment(BaseModel):
    """Payment comment model"""
    type: int
    text: str


class PaymentInitiationRequest(BaseModel):
    """Payment initiation request model"""
    productName: str = "Flight"
    channelType: str = "AMPMailer"
    plateform: str = "AMPMailer"  # keep key as-is if API expects this spelling
    applicationName: str = "Customer"
    returnUrl: str
    merchantViewUrl: str
    comments: List[PaymentComment] = Field(default_factory=list)
    additionalFields: Dict[str, str] = Field(default_factory=dict)


class PaymentLinks(BaseModel):
    """Payment links model"""
    web: Optional[str] = None
    mobile: Optional[str] = None
    iframe: Optional[str] = None


class PaymentFilter(BaseModel):
    """Payment filter model"""
    allowDefaultOptions: bool
    options: List[Dict[str, Any]]


class AddOnAmountRule(BaseModel):
    """Add-on amount rule model"""
    payment_method_type: str
    fee: str
    fee_description: str
    sub_details: Optional[Any] = None
    applicable_per_unit: Optional[Any] = None


class SdkPayload(BaseModel):
    """SDK payload model"""
    requestId: str
    service: str
    payload: Dict[str, Any]
    expiry: str


class PaymentInitiationData(BaseModel):
    """Payment initiation response data model"""
    orderStatus: str
    order_id: str
    id: str
    orderAmount: float
    orderCurrency: str
    payment_links: Optional[PaymentLinks] = None
    sdk_payload: Optional[SdkPayload] = None
    sdkPayload: Optional[str] = None
    additionalFields: Optional[Dict[str, Any]] = None


class PaymentInitiationResponse(BaseModel):
    """Payment initiation response model"""
    status: bool
    data: PaymentInitiationData
    errors: Optional[List[Any]] = None
    messages: Optional[List[Any]] = None
    statusCode: int
    metaData: Optional[Any] = None