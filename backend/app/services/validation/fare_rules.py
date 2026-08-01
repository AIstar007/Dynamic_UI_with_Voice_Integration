from datetime import date, timedelta
from app.core.constants import (
    PassengerType,
    ErrorCode,
)
from app.core.exceptions import CustomException
from .common import passenger_counts


# 6EXCLUSIVE (VCNF) Fare Validation
def validate_6exclusive(request):

    counts = passenger_counts(request)

    if counts[PassengerType.SRCT] > 0:
        raise CustomException(
            code=ErrorCode.VCNF_SENIOR_NOT_ALLOWED,
            message="6Exclusive fare cannot be used with Senior Citizen.",
            status_code=400,
        )
    if request.beginDate < date.today() + timedelta(days=7):
        raise CustomException(
            code=ErrorCode.VCNF_DATE_RESTRICTION,
            message="6Exclusive fare is valid only for travel after 7 days from today.",
            status_code=400,
        )
    

# STUDENT (STUD) Fare Validation    
def validate_student(request):
    counts = passenger_counts(request)

    if counts[PassengerType.SRCT] > 0:
        raise CustomException(
            code=ErrorCode.STUD_SENIOR_NOT_ALLOWED,
            message="Student fare cannot be used with Senior Citizen.",
            status_code=400,
        )
    if counts[PassengerType.CHD] > 0:
        raise CustomException(
            code=ErrorCode.STUD_CHILD_NOT_ALLOWED,
            message="Student fare cannot be used with Children.",
            status_code=400,
        )
    if counts[PassengerType.INFT] > 0:
        raise CustomException(
            code=ErrorCode.STUD_INFANT_NOT_ALLOWED,
            message="Student fare cannot be used with Infants.",
            status_code=400,
        )
    

# FAMILY & FRIEND (FNF) Fare Validation
def validate_family_and_friend(request):
    counts = passenger_counts(request)

    if counts[PassengerType.SRCT] > 0:
        raise CustomException(
            code=ErrorCode.FNF_SENIOR_NOT_ALLOWED,
            message="Family & Friend fare cannot be used with Senior Citizen.",
            status_code=400,
        )
    
    # productClass rule
    if not request.filters or not request.filters.productClasses:
        raise CustomException(
            code=ErrorCode.FNF_PRODUCT_CLASS_INVALID,
            message="Family & Friends fare requires productClass ['A'].",
            status_code=400,
        )
    
    if request.filters.productClasses != ["A"]:
        raise CustomException(
            code=ErrorCode.FNF_PRODUCT_CLASS_INVALID,
            message="Family & Friends fare requires productClass ['A'].",
            status_code=400,
        )
    

# ARMED FORCES (DFN)    
def validate_armed_forces(request):
    counts = passenger_counts(request)

    if counts[PassengerType.SRCT] > 0:
        raise CustomException(
            code=ErrorCode.DFN_SENIOR_NOT_ALLOWED,
            message="Armed Forces fare cannot be used with Senior Citizen.",
            status_code=400,
        ) 


# UNACCOMPANIED MINOR (UMNR)
def validate_unaccompanied_minor(request):
    counts = passenger_counts(request)

    #Only childern allowed
    if (
        counts[PassengerType.ADT] > 0
        or counts[PassengerType.SRCT] > 0
        or counts[PassengerType.INFT] > 0
        ):

        raise CustomException(
            code=ErrorCode.UMNR_INVALID_COMBINATION,
            message="Unaccompanied Minor fare can only be used with Children.",
            status_code=400,
        )
    
    if counts[PassengerType.CHD] == 0:
        raise CustomException(
            code=ErrorCode.UMNR_NO_CHILD,
            message="Unaccompanied Minor fare requires at least one child.",
            status_code=400,
        ) 