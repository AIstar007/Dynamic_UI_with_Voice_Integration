from datetime import date
from typing import List, Optional, Tuple
from pydantic import BaseModel
from app.core.constants import ErrorCode, PromotionCode
from app.core.exceptions import CustomException
from app.models.base_response import BaseResponse
from app.models.booking_model import BookingResponse
from app.models.error_response import ErrorDetails
from app.models.search_flight_request_model import (
    AvailabilityCodeCriteria,
    AvailabilityCriteriaFilter,
    AvailabilitySearchRequest,
    PassengerSearchCriteria,
    PassengerTypeCriteria,
)
from app.models.token_model import TokenResponse
from app.repositories.NavRepository import NavRepository
from app.models.search_flight_response_model import FlightSearchResponse
from app.models.payment_model import PaymentInitiationResponse
from app.services.validation import get_promotion_code, get_validator, validate_common
from app.models.sell_trip_model import (
    BookFlightRequest,
    Key,
    PassengerType,
    PassengerDetails,
)
from app.models.contact_details_model import (
    ContactDetailsRequest,
    ContactDetailsResponse,
    PassengerSummary,
    PassengerSummary,
    PhoneNumber,
    Name,
    PostedContactDetails
)
from app.models.add_passenger_model import (
    AddPassengerRequest,
    PostName,
    PostInfo,
    ListPostAddPassenger
)
from app.utils.mics_helper import (
    gender_for_title,
    normalize_promotion_code,
    normalize_title,
)


class SellTripServiceKeys(BaseModel):
    journey_key: str
    fare_key: str


class NavService:
    def __init__(self, repo: NavRepository):
        self.repo = repo

    @staticmethod
    def _validation_error(
        code: str,
        message: str,
        status_code: int = 400,
    ) -> BaseResponse[FlightSearchResponse]:
        return BaseResponse(
            data=None,
            status_code=status_code,
            errors=[
                ErrorDetails(
                    code=code,
                    message=message,
                    raw_message=message,
                    type="ValidationError",
                )
            ],
        )

    def _parse_date(
        self,
        date_value: str,
        field_name: str,
    ) -> Tuple[Optional[date], Optional[BaseResponse[FlightSearchResponse]]]:
        try:
            return date.fromisoformat(date_value), None
        except ValueError:
            return None, self._validation_error(
                code="INVALID_DATE_FORMAT",
                message=f"{field_name} must be in YYYY-MM-DD format.",
            )
        

    async def get_booking(self, RecordLocator: str, LastName: str) -> BaseResponse[BookingResponse]:
        token_response : BaseResponse[TokenResponse] = await self.repo.create_token()
        if(token_response.data is None or token_response.data.token is None):
            return BaseResponse(data=None, errors=token_response.errors, status_code=token_response.status_code)
        token = token_response.data.token
        booking_response : BaseResponse[BookingResponse] = await self.repo.get_booking(RecordLocator, LastName, token)
        return booking_response


    async def search_flight(
        self, 
        token: str,
        origin: str,
        destination: str,
        begin_date: str,
        num_adults: int,
        senior_citizen: int = 0,
        infant: int = 0,
        end_date: Optional[str] = None,
        num_child: int = 0,
        promotion_code: Optional[str] = None,
        filters: Optional[AvailabilityCriteriaFilter] = None,
    ) -> BaseResponse[FlightSearchResponse]:
        begin_date_value, begin_date_error = self._parse_date(
            date_value=begin_date,
            field_name="begin_date",
        )
        if begin_date_error:
            return begin_date_error

        end_date_value: Optional[date] = None
        if end_date:
            parsed_end_date, end_date_error = self._parse_date(
                date_value=end_date,
                field_name="end_date",
            )
            if end_date_error:
                return end_date_error
            end_date_value = parsed_end_date

        if end_date_value and end_date_value < begin_date_value:
            return self._validation_error(
                code="INVALID_RETURN_DATE",
                message="Return date cannot be before departure date.",
            )

        normalized_promotion_code = normalize_promotion_code(promotion_code)
        if promotion_code and not normalized_promotion_code:
            return self._validation_error(
                code=ErrorCode.INVALID_PROMOTION_CODE,
                message=(
                    "Invalid promotionCode. Allowed values: "
                    "VCNF/6Exclusive, STUD/Student, DFN/Armed Forces, "
                    "FNF/Family & Friends, UMNR/Unaccompanied Minor."
                ),
            )

        effective_filters = filters.model_copy(deep=True) if filters else None
        if normalized_promotion_code == PromotionCode.FNF.value:
            if effective_filters is None:
                effective_filters = AvailabilityCriteriaFilter(productClasses=["A"])
            elif not effective_filters.productClasses:
                effective_filters.productClasses = ["A"]

        passenger_types = []
        if num_adults > 0:
            passenger_types.append(PassengerSearchCriteria(type="ADT", count=num_adults))
        if num_child > 0:
            passenger_types.append(PassengerSearchCriteria(type="CHD", count=num_child))
        if senior_citizen > 0:
            passenger_types.append(PassengerSearchCriteria(type="ADT", discountCode="SRCT", count=senior_citizen))
        if infant > 0:
            passenger_types.append(PassengerSearchCriteria(type="INFT", count=infant))

        validation_request = AvailabilitySearchRequest(
            origin=origin,
            destination=destination,
            beginDate=begin_date_value,
            endDate=end_date_value,
            passengers=PassengerTypeCriteria(types=passenger_types, residentCountry="IN"),
            codes=AvailabilityCodeCriteria(
                currencyCode="INR",
                promotionCode=normalized_promotion_code,
            ),
            filters=effective_filters,
        )

        try:
            validate_common(validation_request)
            fare_promotion_code = get_promotion_code(validation_request)
            validator = get_validator(fare_promotion_code)
            if validator:
                validator(validation_request)
        except CustomException as ex:
            return self._validation_error(
                code=ex.code,
                message=ex.message,
                status_code=ex.status_code,
            )

        search_response : BaseResponse[FlightSearchResponse] = await self.repo.search_flight(
            token=token,
            origin=origin,
            destination=destination,
            begin_date=begin_date_value,
            end_date=end_date_value,
            num_adults=num_adults,
            num_child=num_child,
            senior_citizen=senior_citizen,
            infant=infant,
            promotion_code=normalized_promotion_code,
            filters=effective_filters,
        )
        return search_response
    

    async def sell_trip(self,
        token: str,
        keys: List[SellTripServiceKeys],
        journey_key_dep: str,
        fare_key_dep: str,
        journey_key_arr: Optional[str],
        fare_key_arr: Optional[str],
        adult_count: int,
        children_count: int,
        promotion_code: Optional[str] = None,
    ) -> BaseResponse[BookingResponse]:

        keys = [
            Key(
                journeyKey=journey_key_dep,
                fareAvailabilityKey=fare_key_dep
            )
        ]

        if journey_key_arr and fare_key_arr:
            keys.append(
                Key(
                    journeyKey=journey_key_arr,
                    fareAvailabilityKey=fare_key_arr
                )
            )

        passenger_types = [
            PassengerType(
                type="ADT",
                count=adult_count
            )
        ] 

        if children_count > 0:
            passenger_types.append(
                PassengerType(
                    type="CHD",
                    count=children_count
                )
            )   

        sell_request = BookFlightRequest(
            keys=keys,
            passengers=PassengerDetails(
                types=passenger_types,
                residentCountry="IN"
            ),
            currencyCode="INR",
            promotionCode=promotion_code
        )

        sell_response : BaseResponse[BookingResponse] = await self.repo.sell_trip(
            token=token,
            request_body=sell_request
        )

        if sell_response.data is not None:
            sell_response.data.token = token

        return sell_response
    

    async def contact_details(
    self,
    token: str,
    number: str,
    email: str,
    first_name: str,
    last_name: str,
    title: str,
    ) -> BaseResponse[PostedContactDetails]:
            
            contact_request = ContactDetailsRequest(
                phoneNumbers=[
                    PhoneNumber(
                        type=1,
                        number=number
                    )
                ],
                emailAddress=email,
                name=Name(
                    first=first_name,
                    last=last_name,
                    title=title
                ),
            )

            add_contact_response = await self.repo.add_contact_details(
                token=token,
                request_body=contact_request
            )

            if add_contact_response.status_code >= 400 or add_contact_response.errors:
                error_message = (
                    add_contact_response.errors[0].message
                    if add_contact_response.errors
                    else "Failed to add contact details"
                )
                raise ValueError(error_message)

            booking_response = await self.repo.get_booking_from_session(
                token=token
            )

            if booking_response.data is None:
                raise ValueError("Invalid get Booking Response")
            
            passengers = []

            for i, passenger in enumerate(
                booking_response.data.passengers.values()
            ):
                
                full_name = ""
                if passenger.name:
                    full_name =(
                        f"{passenger.name.first}"
                        f" {passenger.name.last}"
                    )

                passengers.append(
                    {
                        "index": i+1,
                        "name": full_name
                    }
                )
                
            return ContactDetailsResponse(
            passengers=[
                PassengerSummary(
                    index=i + 1,
                    name=f"{p.name.first.capitalize() if p.name else ''} "
                        f"{p.name.last.capitalize() if p.name else ''}",
                )
                for i, p in enumerate(
                    booking_response.data.passengers.values()
                )
            ],
            token=token,
            breakdown=booking_response.data.breakdown,
            journeys=booking_response.data.journeys,
        )

    async def initiate_payment(
        self,
        token: str,
        return_url: Optional[str] = None,
        merchant_view_url: Optional[str] = None,
    ) -> BaseResponse[PaymentInitiationResponse]:
        return await self.repo.initiate_payment(
            token=token,
            return_url=return_url,
            merchant_view_url=merchant_view_url,
        )
    
    async def add_passenger(
    self,
    token: str,
    passenger_keys: str,

    total_adult_count: int,
    total_children_count: int = 0,

    # adults
    passenger_title1: Optional[str] = None,
    first_name1: Optional[str] = None,
    last_name1: Optional[str] = None,

    passenger_title2: Optional[str] = None,
    first_name2: Optional[str] = None,
    last_name2: Optional[str] = None,

    passenger_title3: Optional[str] = None,
    first_name3: Optional[str] = None,
    last_name3: Optional[str] = None,

    passenger_title4: Optional[str] = None,
    first_name4: Optional[str] = None,
    last_name4: Optional[str] = None,

    passenger_title5: Optional[str] = None,
    first_name5: Optional[str] = None,
    last_name5: Optional[str] = None,

    passenger_title6: Optional[str] = None,
    first_name6: Optional[str] = None,
    last_name6: Optional[str] = None,

    passenger_title7: Optional[str] = None,
    first_name7: Optional[str] = None,
    last_name7: Optional[str] = None,

    passenger_title8: Optional[str] = None,
    first_name8: Optional[str] = None,
    last_name8: Optional[str] = None,

    passenger_title9: Optional[str] = None,
    first_name9: Optional[str] = None,
    last_name9: Optional[str] = None,

    # children
    child_title1: Optional[str] = None,
    child_first_name1: Optional[str] = None,
    child_last_name1: Optional[str] = None,

    child_title2: Optional[str] = None,
    child_first_name2: Optional[str] = None,
    child_last_name2: Optional[str] = None,

    child_title3: Optional[str] = None,
    child_first_name3: Optional[str] = None,
    child_last_name3: Optional[str] = None,

    child_title4: Optional[str] = None,
    child_first_name4: Optional[str] = None,
    child_last_name4: Optional[str] = None,

    child_title5: Optional[str] = None,
    child_first_name5: Optional[str] = None,
    child_last_name5: Optional[str] = None,

    child_title6: Optional[str] = None,
    child_first_name6: Optional[str] = None,
    child_last_name6: Optional[str] = None,

    child_title7: Optional[str] = None,
    child_first_name7: Optional[str] = None,
    child_last_name7: Optional[str] = None,

    child_title8: Optional[str] = None,
    child_first_name8: Optional[str] = None,
    child_last_name8: Optional[str] = None,
):

        pax_keys = [k.strip() for k in passenger_keys.split(",") if k.strip()]
        required_count = total_adult_count + total_children_count
        if len(pax_keys) < required_count:
            raise ValueError(
                f"Not enough passenger_keys. required={required_count}, provided={len(pax_keys)}"
            )

        # collect inputs
        adults = [
            (passenger_title1, first_name1, last_name1),
            (passenger_title2, first_name2, last_name2),
            (passenger_title3, first_name3, last_name3),
            (passenger_title4, first_name4, last_name4),
            (passenger_title5, first_name5, last_name5),
            (passenger_title6, first_name6, last_name6),
            (passenger_title7, first_name7, last_name7),
            (passenger_title8, first_name8, last_name8),
            (passenger_title9, first_name9, last_name9),
        ]

        children = [
            (child_title1, child_first_name1, child_last_name1),
            (child_title2, child_first_name2, child_last_name2),
            (child_title3, child_first_name3, child_last_name3),
            (child_title4, child_first_name4, child_last_name4),
            (child_title5, child_first_name5, child_last_name5),
            (child_title6, child_first_name6, child_last_name6),
            (child_title7, child_first_name7, child_last_name7),
            (child_title8, child_first_name8, child_last_name8),
        ]

        all_passengers: dict[str, AddPassengerRequest] = {}
        
        # ---------------- ADULTS ----------------
        for i in range(total_adult_count):
            title, first, last = adults[i]
            normalized_title = normalize_title(title)

            req = AddPassengerRequest(
                name=PostName(
                    first=first,
                    last=last,
                    title=normalized_title,
                ),
                info=PostInfo(
                    gender=gender_for_title(normalized_title)
                ),
            )

            add_response = await self.repo.add_passenger_details(
                token=token,
                passenger_key=pax_keys[i],
                request_body=req,
            )

            if add_response.status_code >= 400 or add_response.errors:
                error_message = (
                    add_response.errors[0].message
                    if add_response.errors
                    else "Failed to add passenger"
                )
                raise ValueError(
                    f"Failed to add passenger '{pax_keys[i]}': {error_message}"
                )

            all_passengers[pax_keys[i]] = req

        # ---------------- CHILDREN ----------------
        for i in range(total_children_count):
            title, first, last = children[i]
            child_index = total_adult_count + i  # index for children in pax_keys
            normalized_title = normalize_title(title)

            req = AddPassengerRequest(
                name=PostName(
                    first=first,
                    last=last,
                    title=normalized_title,
                ),
                info=PostInfo(
                    gender=gender_for_title(normalized_title)
                ),
            )

            add_response = await self.repo.add_passenger_details(
                token=token,
                passenger_key=pax_keys[child_index],
                request_body=req,
            )

            if add_response.status_code >= 400 or add_response.errors:
                error_message = (
                    add_response.errors[0].message
                    if add_response.errors
                    else "Failed to add passenger"
                )
                raise ValueError(
                    f"Failed to add passenger '{pax_keys[child_index]}': {error_message}"
                )

            all_passengers[pax_keys[child_index]] = req

        return ListPostAddPassenger(
            token=token,
            PassengerList=all_passengers,
        )