from app.core.constants import PromotionCode

from .fare_rules import (
    validate_6exclusive,
    validate_student,
    validate_armed_forces,
    validate_family_and_friend,
    validate_unaccompanied_minor
)


# VALIDATOR REGISTRY

VALIDATORS = {
    PromotionCode.VCNF.value: validate_6exclusive,
    PromotionCode.STUD.value: validate_student,
    PromotionCode.DFN.value: validate_armed_forces,
    PromotionCode.FNF.value: validate_family_and_friend,
    PromotionCode.UMNR.value: validate_unaccompanied_minor,
}


def get_validator(promotion_code: str):
    """
    Safe getter for validator function
    """
    if not promotion_code:
        return None

    return VALIDATORS.get(promotion_code.upper())