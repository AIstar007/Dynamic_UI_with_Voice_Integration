from pydantic import BaseModel
from typing import List, Optional
from datetime import date


# Passenger Models

class PassengerSearchCriteria(BaseModel):
    type: str                          # maxLength: 4 (ADT, CHD, INFT)
    discountCode: Optional[str] = None
    count: int


class PassengerTypeCriteria(BaseModel):
    types: List[PassengerSearchCriteria]
    residentCountry: Optional[str] = None   # maxLength: 2



# Codes

class AvailabilityCodeCriteria(BaseModel):
    currencyCode: Optional[str] = None
    promotionCode: Optional[str] = None
    sourceOrganization: Optional[str] = None
    currentSourceOrganization: Optional[str] = None


# Filters

class AvailabilityCriteriaFilter(BaseModel):
    fareInclusionType: Optional[int] = 0       # 0=Default,1=Standby,2=Overbook,3=NoPricing
    compressionType: Optional[int] = 0         # 0=LowestFareClass,1=CompressByProductClass,2=Default
    maxPrice: Optional[float] = None
    minPrice: Optional[float] = None
    loyalty: Optional[int] = 0                 # 0=MonetaryOnly,1=PointsOnly,2=Points+Money,3=Preserve
    includeAllotments: Optional[bool] = True
    exclusionType: Optional[int] = 0           # 0=Default,1=ExcludeDeparted,2=ExcludeImminent,3=ExcludeUnavailable
    sortOptions: Optional[List[int]] = None
    productClasses: Optional[List[str]] = None
    travelClasses: Optional[List[str]] = None
    fareTypes: Optional[List[str]] = None
    classesOfService: Optional[List[str]] = None
    carrierCode: Optional[str] = None
    identifier: Optional[str] = None
    type: Optional[int] = None                 # FlightType (0–5)
    connectionType: Optional[int] = None       # SoldAsConnectionType (0–3)
    maxConnections: Optional[int] = None
    bundleControlFilter: Optional[int] = None  # 0=Disabled,1=BundleSets,2=BundleOffers


# -----------------------------
# ROOT MODEL
# -----------------------------

class AvailabilitySearchRequest(BaseModel):
    origin: str
    destination: str
    searchDestinationMacs: Optional[bool] = None
    searchOriginMacs: Optional[bool] = None
    beginDate: date
    endDate: Optional[date] = None
    passengers: PassengerTypeCriteria
    codes: Optional[AvailabilityCodeCriteria] = None
    filters: Optional[AvailabilityCriteriaFilter] = None
    taxesAndFees: Optional[int] = 0             # 0=None,1=Taxes,2=TaxesAndFees
    ssrCollectionsMode: Optional[int] = 0       # 0=None,1=Leg
    numberOfFaresPerJourney: Optional[int] = None
    returnEmptyResults: Optional[bool] = False