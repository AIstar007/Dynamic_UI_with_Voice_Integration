from collections import defaultdict
from datetime import date


from app.core.constants import (
    PassengerType,
    MAX_PASSENGERS,
    MAX_CHILDREN,
    MAX_INFANTS,
    ErrorCode,
)

from app.core.exceptions import CustomException

# Passenger Validation Functions

def passenger_count(request):
    """
    Returns:
        dict: {ADT:x, CHD:y, INFT:z, SRCT:w}
    """

    counts = defaultdict(int)
    
    for p in request.passengers.types:
        counts[p.type] += p.count

    return counts


def passenger_counts(request):
    """
    Backward-compatible alias for fare_rules import.
    """
    return passenger_count(request)


def get_promotion_code(request):
    """
    Returns:
        str: Promotion code safely
    """
    if request.codes and request.codes.promotionCode:
        return request.codes.promotionCode.strip().upper()
    return None


# Common Validation Functions

def validate_common(request): 

    counts = passenger_count(request)

    adults = counts[PassengerType.ADT]
    seniors = counts[PassengerType.SRCT]
    children = counts[PassengerType.CHD]
    infants = counts[PassengerType.INFT]

    # Max passenegres (ADT + CHD + SRCT)
    if adults + seniors + children > MAX_PASSENGERS:
        raise CustomException(
            code=ErrorCode.MAX_PASSENGERS,
            message="Maximum 9 passengers allowed",
            status_code=400,
        )
    
    # Max children
    if children > MAX_CHILDREN:
        raise CustomException(
            code=ErrorCode.MAX_CHILDREN,
            message="Maximum 4 children allowed",
            status_code=400,
        )  

    # Max infants
    if infants > MAX_INFANTS:  
        raise CustomException(
            code=ErrorCode.MAX_INFANTS,
            message="Maximum 4 infants allowed",
            status_code=400,
        )
    
    # Infant Must have adult
    if infants > adults:
        raise CustomException(
            code=ErrorCode.INFANT_WITHOUT_ADULT,
            message="Infants must be accompanied by at least one adult",
            status_code=400,
        )
    
    # Travel date validation
    if request.beginDate < date.today():
        raise CustomException(
            code=ErrorCode.INVALID_TRAVEL_DATE,
            message="Travel date cannot be in the past",
            status_code=400,
        )