# from __future__ import annotations

from typing import Optional, List, Dict, Tuple
from textwrap import dedent
from typing_extensions import Annotated

from agent_framework import ChatAgent, ChatClientProtocol, ai_function
from pydantic import Field
from agent_framework_ag_ui import AgentFrameworkAgent
# from helper import (
#     get_or_generate_graphql_token,
#     retrieve_booking_from_graphql_api,
#     convert_to_toon,
#)

import logging
import json
import os

logging.basicConfig(level=logging.WARNING, format="%(levelname)s - %(message)s")
logger = logging.getLogger("graphql-booking-agent")

# ========== Indigo Agent Tools Integration ========== #
import base64
from typing import Dict, Any
import asyncio
import requests
import httpx
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding

TOKEN_API_URL = "https://dotrezapi45-nonprod-3scale-apicast-production.apps.ocpnonprodcl01.goindigo.in/api/nsk/v2/token"
TOKEN_USER_KEY = os.getenv("TOKEN_USER_KEY", "b606c5f2277c7278d0be64a600635a21")
ELIGIBILITY_API_URL = "https://api-uat-skyplus.goindigo.in/flightupgrade/v1/upgradestretch/eligibility"
ELIGIBILITY_USER_KEY = "2945e931b5e99bceed811fd202713432"
ELIGIBILITY_TIMEOUT_SEC = 15
RETRIEVE_API = "https://api-uat-skyplus.goindigo.in/flightupgrade/v1/upgradestretch/retrieve"
DYNAMIC_PRICE_API = "https://ancillaryengine-nonprod-3scale-apicast-production.apps.ocpnonprodcl01.goindigo.in/stretch/recommendation"
STRETCH_USER_KEY = "a7d511cec49d91aa4978b1937cbd4451"
UPGRADE_API_URL = r"https://api-uat-skyplus.goindigo.in/flightupgrade/v1/upgradestretch/upgrade"

PUBLIC_KEY_PEM = """
-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAyuc1oY3hXeeuiFb/9prBVG0m
C1ZcoK7RBin8izPXgiolPPM//0eIlTBf9bUhlVlU4dzPOiEVgedMUvnWzokEvT9tqo8U
1vk6WnMVMbo3OfVcTDKAIq782OJLNN6U0RCrQq4RQdb0dE5WQOxJ7lQnanbEP1uZO7Ex
kD2YE8n0CVTArnRa8u2k4wC9r4CjzDopBKfPYL5GtZVlOxiJYlysHgfRLosnmBsqfL8e
BEXmkICVqaZGa3yRyyQAWfNngGCdytDe1XR/buCjfz4Jj8Y5WKNpZ7OijqyRKnyysW5r
8/G+WV5RPEb06xsbA8iZOwqokQqDvl9Ml6u2Pyz9X/7thU/+RFUJPZO/seEC3tXVr8uO
XoB9Mu/eOIRez3gkzBEJGQXLdIef4S0hBUIPus9OhntMer2OcXTHIryvl+7Lvcqq45fl
A79NpK2e1chOcxBS5/lVMAc6xBjdFi+0WHqhm72he315w0xQp6Mua5bHrKAQvi+Tzw15
TjXcY9mZha/46JVgVX6/PsGyakSCK6F1YBeSSMYLsP4Ej8cH23LOtqkQlbqRKAX2tnEo
/7juHCtx7E9k3xHqB1dKR21qkf3Wq+qLERAtoZK40HcBb25CbKU21StYVI2pwRWCSTUP
GWG/Mtc1dShEX40J3HKVW2XwghjlyCY110G0K8dFAOvSNaUCAwEAAQ==
-----END PUBLIC KEY-----
"""

def encrypt(value: str) -> str:
    key = serialization.load_pem_public_key(PUBLIC_KEY_PEM.encode())
    encrypted = key.encrypt(
        value.encode(),
        padding.OAEP(
            mgf=padding.MGF1(hashes.SHA1()),
            algorithm=hashes.SHA1(),
            label=None,
        )
    )
    return base64.b64encode(encrypted).decode()

# Alias for compatibility with the corrected function
encrypt_with_public_key = encrypt

# ---------------------------------------------------------------------
# Agent Framework Tools
# ---------------------------------------------------------------------



def create_agent(chat_client: ChatClientProtocol) -> AgentFrameworkAgent:
    """Instantiate the CopilotKit demo agent backed by Microsoft Agent Framework."""

    
    @ai_function(name="generate_token", description="Generate authentication token for the session which will be same throughout whole session.")
    def generate_token() -> Dict[str, Any]:
        """Generate authentication token for Indigo APIs"""
        response = requests.post(
            TOKEN_API_URL,
            headers={
                "Content-Type": "application/json",
                "user_key": TOKEN_USER_KEY
            },
            json={},
            timeout=15,
            verify=False
        )
        response.raise_for_status()
        result = response.json()
        print('token response====================',result)
        token = result.get("data").get("token", "")
        if(token == ""):
            return {
                "status": 500,
                "error": "Failed to generate token",
                "message": "Please try again to get availability information."
            }
        return {
            "status": 200,
            "token": token,
        }
        
    # @ai_function(
    #     name="get_eligibility",
    #     description="Retrieve eligibility for a booking using Indigo APIs. Requires RecordLocator, LastName, and token."
    # )
    def get_eligibility(RecordLocator: str, LastName: str, token: str) -> Dict[str, Any]:
        """
        Retrieve eligibility details for a booking using Indigo APIs. 
        
        Flow:
        1. Use the provided token.
        2. Call retrieve eligibility endpoint with required RecordLocator/PNR and LastName.
        3. Return eligibility JSON response or error.
        
        Args:
            RecordLocator: The booking record locator (required)
            LastName: The passenger's last name (required)
            token: The authorization token (required)
        """
        # Build input data from individual parameters
        input_data = {
            "RecordLocator": RecordLocator,
            "LastName": LastName,
        }

        # Encrypt all values for query params
        params = {k: encrypt_with_public_key(v) for k, v in input_data.items() if v is not None}

        # Step 1: Used the Generated_Token from the tool generate_token
    
        # Step 2: Call eligibility endpoint
        headers = {
            "Authorization": token,
            "user_key": ELIGIBILITY_USER_KEY,
            "Content-Type": "application/json",
        }
        try:
            response = requests.get(
                ELIGIBILITY_API_URL,
                headers=headers,
                params=params,
                timeout=ELIGIBILITY_TIMEOUT_SEC,
            )
            response.raise_for_status()
            print('eligibility response====================',response.json())
            print('retrieved eligibility====================', LastName, RecordLocator,token)
            final_response = {
                "status": response.status_code,
                "retrieve": response.json(),
                "token_used": token,
            }
            return final_response
        except requests.HTTPError as http_err:
            try:
                detail = response.json()
            except Exception:
                detail = response.text
            return {"status": response.status_code, "error": str(http_err), "response": detail}
        except Exception as e:
            return {"status": 500, "error": str(e)}

    @ai_function(name="get_available_journeys", description="Get available upgradable journeys for a booking using Indigo APIs. Requires RecordLocator/PNR and LastName.")
    def get_available_journeys(RecordLocator: str, LastName: str, token: str) -> Dict[str, Any]:
        """Get upgradable journey availability information"""
        
        # Step 2: Call eligibility endpoint to check booking details
        eligibility_response = get_eligibility(RecordLocator, LastName, token)
        if(("errors" in eligibility_response and eligibility_response["errors"] is not None ) or (not eligibility_response.get("retrieve",{}).get("eligible", False))):
            return {
                "status": 500,
                "error": "Failed to retrieve eligibility details",
                "code": eligibility_response["errors"].get("code","FailedEligibilty"),
                "message": eligibility_response["errors"].get("message","Please try again to get availability information.")
            }
        for flag in eligibility_response["retrieve"].get("upgradeEligibilityDetails", []):
            for k,v in flag.items():
                if(v is not None and v == False):
                    return {
                        "status": 500,
                        "error": "Booking not eligible for upgrade",
                        "code": "NotEligibleForUpgrade",
                        "message": "Your booking is not eligible for upgrade. Please check your booking details and try again."
                    }
       
        # Step 3: Call retrieve endpoint to get upgradable journeys
        response = requests.get(
            RETRIEVE_API,
            headers={
                "Authorization": token,
                "user_key": ELIGIBILITY_USER_KEY
            },
            timeout=15
        )
        response.raise_for_status() 
        result = response.json()
        found_key = False
        use_key = ""
        
        if("data" in result and result["data"] is not None and "journeys" in result["data"] and result["data"]["journeys"] is not None and len(result["data"]["journeys"]) > 0):
            for journey in result["data"]["journeys"]:
                found_key = False
                use_key = ""
                if("segments" in journey and journey["segments"] is not None and len(journey["segments"]) > 0):
                    for segment in journey["segments"]:
                        if("classModifyKey" in segment and segment["classModifyKey"] is not None):
                            journey["classModifyKey"] = segment["classModifyKey"]
                            found_key = True
                            journey["useKey"] = "classModifyKey"
                if(found_key):
                    continue
                if("fareOptions" in journey and journey["fareOptions"] is not None and len(journey["fareOptions"]) > 0):
                    for fareOption in journey["fareOptions"]:
                        if("fareAvailabilityKey" in fareOption and fareOption["fareAvailabilityKey"] is not None):
                            journey["fareAvailabilityKey"] = fareOption["fareAvailabilityKey"]
                            journey["useKey"] = "fareAvailabilityKey"
                            found_key = True
                            break
            upgradable_journeys = []
            for journey in result["data"]["journeys"]:
                useKey = journey.get("useKey","")
                if(useKey and useKey == "fareAvailabilityKey"):
                    journey["upgrade_keys"] = [{
                        "journeyKey": journey.get("journeyKey",""),
                        "fareAvailabilityKey": journey.get("fareAvailabilityKey",""),
                        "classModifyKey": None,
                        "segmentKey": [i.get("segmentKey","") for i in journey.get("segments",[{}])]
                    }]
                    upgradable_journeys.append(journey)
                    continue
                upgradable_segments = []
                keys = []
                for segment in journey.get("segments", []):
                    key = segment.get("classModifyKey", "")
                    if key and len(key) > 0:
                        keys.append({
                            "journeyKey": journey.get("journeyKey",""),
                            "classModifyKey": key,
                            "fareAvailabilityKey": None,
                            "segmentKey": [segment.get("segmentKey","")]
                        })
                        upgradable_segments.append(segment)
                if(len(upgradable_segments) > 0):
                    journey["segments"] = upgradable_segments
                    journey["keys"] = keys
                    upgradable_journeys.append(journey)
            if len(upgradable_journeys) == 0:
                return {
                    "status": 500,
                    "error": "No Upgradable journeys found",
                    "message": "Please check your booking details and try again."
                }
            result["data"]["journeys"] = upgradable_journeys
        else:
            return {
                "status": 500,
                "error": "No Upgradable journeys found",
                "message": "Please check your booking details and try again."
            }
        # print('retrieve response====================',result)

        return {
            "status": 200,
            "message": "Upgradable journeys retrieved successfully",
            "token_used": token,
            "available_journeys": result["data"]["journeys"]          
            
        }

    @ai_function(
        name="upgrade_stretch_booking",
        description="Flight journeys using the Indigo flight upgrade API. Requires token and a list of upgrade_keys objects."
    )
    def upgrade_stretch_booking(
        upgrade_keys: List[Dict[str, Any]],  # List of dicts, not tuples
        token: str
    ) -> Dict[str, Any]:
        """
        Upgrade flight journeys using the Indigo flight upgrade API.

        Flow:
        1. Use the provided token.
        2. Call upgrade endpoint for each upgrade_key in the list.
        3. Return upgrade JSON response or error for each.

        
        """
        # Debug: Print input to verify structure
        logger.info(f"upgrade_stretch_booking called with upgrade_keys: {json.dumps(upgrade_keys, indent=2)}")
        logger.info(f"Token: {token}")
        print('upgrade_keys====================',upgrade_keys)
        responses = []
        for upgrade in upgrade_keys:
            journeyKey = upgrade.get("journeyKey", "")
            segmentKey = upgrade.get("segmentKey", [])
            classModifyKey = upgrade.get("classModifyKey", "")
            fareAvailabilityKey = upgrade.get("fareAvailabilityKey", "")

            # Step 2: Build payload from individual parameters
            if classModifyKey is not None and classModifyKey != "":
                payload = {
                    "journeysToUpgrade": [
                        {
                            "journeyKey": journeyKey,
                            "classModifyKey": classModifyKey
                        }
                    ]
                }
            elif fareAvailabilityKey is not None and fareAvailabilityKey != "":
                payload = {
                    "journeysToUpgrade": [
                        {
                            "journeyKey": journeyKey,
                            "fareKey": fareAvailabilityKey
                        }
                    ]
                }
            else:
                responses.append({
                    "status": 400,
                    "error": "Either classModifyKey or fareAvailabilityKey must be provided.",
                    "sector": [journeyKey, segmentKey]
                })
                continue

            # Step 3: Call upgrade endpoint
            headers = {
                "Authorization": token,
                "user_key": ELIGIBILITY_USER_KEY,
                "Content-Type": "application/json",
            }
            final_response = {}
            try:
                logger.info(f"Calling upgrade API: {UPGRADE_API_URL}")
                logger.info(f"Headers: {headers}")
                logger.info(f"Payload: {payload}")
                response = requests.post(
                    UPGRADE_API_URL,
                    headers=headers,
                    json=payload,
                    timeout=ELIGIBILITY_TIMEOUT_SEC,
                )
                print('upgrade response====================',response.json())

                logger.info(f"Response status: {response.status_code}")
                logger.info(f"Response headers: {response.headers}")
                try:
                    response.raise_for_status()
                    result = response.json()
                    logger.info("Flight upgrade processed successfully")
                    final_response = {
                        "upgrade_result": result,
                        "sector": [journeyKey, segmentKey],
                        "status": response.status_code
                    }
                except requests.HTTPError as http_err:
                    try:
                        detail = response.json()
                        final_response = {
                            "status": "already_upgraded",
                            "message": "You are already upgraded to Stretch seat. No further upgrade is needed.",
                            "customer_message": "Your seat has already been upgraded. Enjoy your enhanced travel experience!",
                            "sector": [journeyKey, segmentKey],
                            "details": detail
                        }
                    except Exception:
                        detail = response.text
                        final_response = {
                            "status": "already_upgraded",
                            "message": "You are already upgraded to Stretch seat. No further upgrade is needed.",
                            "customer_message": "Your seat has already been upgraded. Enjoy your enhanced travel experience!",
                            "sector": [journeyKey, segmentKey],
                            "details": detail
                        }
            except requests.Timeout:
                logger.error(f"Request timed out after {ELIGIBILITY_TIMEOUT_SEC}s")
                final_response = {
                    "status": 500,
                    "error": f"Request timeout after {ELIGIBILITY_TIMEOUT_SEC}s",
                    "sector": [journeyKey, segmentKey]
                }
            except Exception as e:
                logger.error(f"Upgrade API call failed: {e}")
                final_response = {
                    "status": 500,
                    "error": f"API call failed: {str(e)}",
                    "sector": [journeyKey, segmentKey]
                }
           
            responses.append(final_response)
        print('final upgrade responses====================',responses)
        return {"upgrades": responses}

    def auto_select_seat(seats_resp: Dict[str, Any], seat_preference: Optional[str]) -> Optional[Dict[str, Any]]:
        try:
            seat_maps = seats_resp.get("data", {}).get("seatMaps", [])
            passengers = seats_resp.get("data", {}).get("passengers", [])
            journeys = seats_resp.get("data", {}).get("journeysDetail", [])
            jsKeys = []
            for journey in journeys:
                for segment in journey.get("segments", []):
                    jsKeys.append([journey.get("journeyKey",""), segment.get("segmentKey","")])
            pax_count = len(passengers)
            seats=[]
            seat_map_itrs = 0
            for sm in seat_maps:
                compartments = sm["seatMap"]["decks"]["1"]["compartments"]
                if "C" not in compartments:
                    continue
                for seat in compartments["C"].get("units", []):
                    if not seat.get("assignable"):
                        continue
                    selected_seat = None
                    if seat_preference is not None:
                        for prop in seat.get("properties", []):
                            if prop.get("code").lower() == seat_preference and prop.get("value").lower() == "true":
                                selected_seat = seat
                                break
                        if(selected_seat is None):
                            continue
                    else:
                        selected_seat = seat
                    if(len(seats) < pax_count):
                        group_code = ""
                        for prop in selected_seat.get("properties", []):
                            if prop.get("code") == "GroupCode":
                                group_code = prop.get("value", "")
                                break
                        selected_seat["passengerKey"]=passengers[len(seats)].get("passengerKey","")
                        selected_seat["name"]=passengers[len(seats)].get("name","")
                        selected_seat["journeyKey"]=jsKeys[seat_map_itrs][0]
                        selected_seat["segmentKey"]=jsKeys[seat_map_itrs][1]
                        selected_seat["aircraftName"] = sm.get("seatMap", {}).get("name","")
                        selected_seat["groupCode"] = group_code
                        seats.append(selected_seat)
                    else:
                        return seats
                if(len(seats) < pax_count):
                    for seat in compartments["C"].get("units", []):
                        if not seat.get("assignable"):
                            continue
                        taken = [taken_seat for taken_seat in seats if seat.get("unitKey","") == taken_seat.get("unitKey","")]
                        if(len(taken) >0):
                            continue
                        if(len(seats) < pax_count):
                            seat["passengerKey"]=passengers[len(seats)].get("passengerKey","")
                            seat["journeyKey"]=jsKeys[seat_map_itrs][0]
                            seat["segmentKey"]=jsKeys[seat_map_itrs][1]
                            seat["name"]=passengers[len(seats)].get("name","")
                            seat["aircraftName"] = sm.get("name","")
                            seats.append(seat)
                seat_map_itrs+=1
        except Exception as ex:
            return None
        return seats

    @ai_function(name="get_entire_seats", description="Get available stretch seats for passengers")
    async def get_entire_seats(authorization: str) -> Dict[str, Any]:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://api-qa-seat-selection-skyplus6e.goindigo.in/v1/seat/getentireseats",
                    headers={
                        "Authorization": authorization,
                        "user_key": "9ad8345ab99a9874003b26b2fa5d3bea"
                    },
                    timeout=30
                )
                response.raise_for_status()

                result = response.json()

                # Process and return simplified result to avoid large responses
                if("data" in result and result["data"] is not None and "seatMaps" in result["data"]):
                    passenger_count = len(result["data"].get("passengers", []))
                    for seatMap in result["data"]["seatMaps"]:
                        if("seatMap" in seatMap and "decks" in seatMap["seatMap"] and 
                        "1" in seatMap["seatMap"]["decks"]):
                            compartment = seatMap["seatMap"]["decks"]["1"].get("compartments", {})
                            if "Y" in compartment:
                                del compartment["Y"]
                            if "C" in compartment:
                                if "availableUnits" in compartment["C"] and compartment["C"]["availableUnits"] is not None and compartment["C"]["availableUnits"] >= passenger_count:
                                    seats=[]
                                    
                                    for unit in compartment["C"].get("units", []):
                                        if unit.get("assignable", False) and unit.get("availability", 0) == 5:
                                            group = unit.get("group", 0)
                                            if(group > 0):
                                                for key, fee in seatMap.get("fees",{}).items():
                                                    fees = fee.get("groups",{}).get(str(group),{}).get("fees",[])
                                                    found, amount = False, 0
                                                    for f in fees:
                                                        for charge in f.get("serviceCharges", []):
                                                            if charge.get("type",0) == 6:
                                                                found = True
                                                                amount += charge.get("amount",0)
                                                    if(found):
                                                        if("seat_fee" not in unit):
                                                            unit["seat_fee"] = {}
                                                        unit["seat_fee"][key] = amount
                                            seats.append(unit)
                                    compartment["C"]["units"] = seats
                    # print(result["data"]["seatMaps"])

                    return {
                        "status": "success",
                        "message": "Seats retrieved successfully",
                        "result": result["data"]["seatMaps"],
                        "passengers": [{"passengerKey": i.get("passengerKey", ""), "name": i.get("name", "")} for i in result["data"].get("passengers", [])],
                    }
                else:
                    return {
                        "status": "error",
                        "message": "No seat data found",
                        "result": [],
                    }
        except Exception as e:
            logger.error(f"Seat selection failed: {str(e)}")
            return {
                "status": "error",
                "message": f"Failed to retrieve seats: {str(e)}",
                "seats": [],
                "passenger_count": 0
            }

    @ai_function(
        name="Seat_Sell",
        description="Sell the selected seat for the passenger. This function should be called after get_entire_seats returns the selected seat details. The agent should extract the necessary seat information and pass individual parameters.")
    def Seat_Sell(
        seat_unitKey: str,
        seat_designator: str, 
        passengerKey: str,
        journeyKey: str,
        segmentKey: str,
        passenger_name_first: str,
        passenger_name_last: str,
        passenger_title: str,
        aircraftName: str,
        authorization_token: str,
        selected_unit: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Sell selected seat using Indigo APIs.
        
        Args:
            seat_unitKey: The seat unit key from selected seat
            seat_designator: The seat number/designator (e.g., "4F")
            passengerKey: The passenger key
            journeyKey: The journey key
            segmentKey: The segment key
            passenger_name_first: Passenger first name
            passenger_name_last: Passenger last name  
            passenger_title: Passenger title (e.g., Mr, Mrs, Ms)
            aircraftName: Aircraft name
            authorization_token: The authorization token
            selected_unit: The entire selected seat unit object (for reference)
        """
        if not all([seat_unitKey, seat_designator, passengerKey, journeyKey, segmentKey, 
                    passenger_name_first, passenger_name_last, authorization_token]):
            return {
                "status": "error",
                "message": "Missing required parameters for seat sale"
            }
        payload = {"seatRequests": [], "seatRemoveRequests": []}
        try:
            passenger_name = {
                "first": passenger_name_first,
                "last": passenger_name_last,
                "title": passenger_title    
            }
            seat_request = {
                "unitKey": seat_unitKey,
                "designator": seat_designator,
                "xlSeat": True,
                "femaleSeat": passenger_title == "Ms" or passenger_title == "Mrs",
                "passengerKey": passengerKey,
                "journeyKey": journeyKey,
                "segmentKey": segmentKey,
                "name": passenger_name,
                "aircraftName": aircraftName
            }
            payload["seatRequests"].append(seat_request)
            print(payload, authorization_token)
            headers = {
                "Authorization": authorization_token,
                "user_key": "80991015849a7d5065304c6b651dc0dc",
                "Content-Type": "application/json"
            }
            logger.info(f"Attempting to sell seat {seat_designator} for passenger {passenger_name_first} {passenger_name_last}")
            response = requests.post(
                "https://api-uat-seat-selection-save-skyplus6e.goindigo.in/v1/seat/sellseats",
                headers=headers,
                json={"data": payload},
                timeout=15,
                verify=False
            )
            print('seat sell response====================',response.text)
            logger.info(f"Seat sell response status: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                logger.info("Seat sold successfully")
                print({
                    "status": "success",
                    "message": f"Successfully sold seat {seat_designator}",
                    "seat_sold": seat_designator,
                    "passenger": f"{passenger_name_first} {passenger_name_last}",
                    "response": result
                })
                return {
                    "status": "success",
                    "message": f"Successfully sold seat {seat_designator}",
                    "seat_sold": seat_designator,
                    "passenger": f"{passenger_name_first} {passenger_name_last}",
                    "response": result
                }
            else:
                try:
                    error_response = response.json()
                    error_message = error_response.get("message", "Unknown error")
                    if "object reference not set" in error_message.lower():
                        return {
                            "status": "partial_success",
                            "message": f"Seat {seat_designator} may have been sold successfully, but there was a server confirmation issue",
                            "seat_sold": seat_designator,
                            "passenger": f"{passenger_name_first} {passenger_name_last}",
                            "warning": "Please verify your booking status in the IndiGo app or website",
                            "server_error": error_message
                        }
                    else:
                        return {
                            "status": "error",
                            "message": f"Failed to sell seat {seat_designator}: {error_message}",
                            "server_response": error_response
                        }
                except:
                    response_text = response.text[:500]
                    if "object reference not set" in response_text.lower():
                        return {
                            "status": "partial_success",
                            "message": f"Seat {seat_designator} may have been sold successfully, but there was a server confirmation issue",
                            "seat_sold": seat_designator,
                            "passenger": f"{passenger_name_first} {passenger_name_last}",
                            "warning": "Please verify your booking status in the IndiGo app or website",
                            "server_error": "Object reference not set to an instance of an object"
                        }
                    else:
                        return {
                            "status": "error",
                            "message": f"HTTP {response.status_code}: Failed to sell seat {seat_designator}",
                            "server_response": response_text
                        }
        except requests.Timeout:
            logger.error("Seat sell request timed out")
            return {
                "status": "error",
                "message": "Request timed out. Please try again or check your booking status.",
                "timeout": True
            }
        except requests.ConnectionError:
            logger.error("Connection error during seat sell")
            return {
                "status": "error",
                "message": "Connection error. Please check your internet connection and try again.",
                "connection_error": True
            }
        except Exception as e:
            logger.error(f"Unexpected error in Seat_Sell: {str(e)}")
            error_str = str(e).lower()
            if "object reference not set" in error_str:
                return {
                    "status": "partial_success",
                    "message": f"Seat {seat_designator} may have been sold successfully, but there was a server confirmation issue",
                    "seat_sold": seat_designator,
                    "passenger": f"{passenger_name_first} {passenger_name_last}",
                    "warning": "Please verify your booking status in the IndiGo app or website",
                    "server_error": str(e)
                }
            else:
                return {
                    "status": "error", 
                    "message": f"Failed to sell seat due to unexpected error: {str(e)}"
                }
            
    @ai_function(
        name="payment_initiate",
        description="Initiate payment for flight booking using Indigo payment API"
    )
    def payment_initiate(
        token: str, return_url: str, merchant_view_url: str
    ) -> Dict[str, Any]:
        """
        Initiate payment for flight booking using Indigo payment API.
        
        Flow:
            1. Use the same token generated by generate_token at the start of the session for payment_initiate; do not generate a new token for payment.
            2. Set the payment API endpoint URL.
            3. Set default return and merchant view URLs if not provided.
            4. Build the payment payload with required and optional fields.
            5. Set the HTTP headers including authorization and user key.
            6. Call the payment initiation endpoint with the payload and headers.
            7. Return the payment initiation JSON response or error details.
            
        Args:
            product_name: Product type (default: "Flight")
            channel_type: Channel type (default: "Web")
            platform: Platform type (default: "Web")
            application_name: Application name (default: "Customer")
            returnUrl: Return URL after payment completion (optional)
            merchantViewUrl: Merchant view URL (optional)
            comments: Payment comments (optional)
            additionalProp1: Additional properties (optional)
        """
 
 
        if not token:
            return {
                "status": "error",
                "message": "Authorization token is required for payment initiation"
            }
       
 
        payment_url = "https://api-uat-skyplus.goindigo.in/prepayment/v1/payment/initiate"
       
        # Set default URLs if not provided
        if return_url is None:
            return_url = "https://s6web-uat.goindigo.in/payment-processing.html?isBookingFlow=1&refUrl=https%253A%252F%252Fs6web-uat.goindigo.in%252Fcontent%252Fskyplus6e%252Fin%252Fen%252Fbook%252Fitinerary.html"
       
        if merchant_view_url is None:
            merchant_view_url = "https://s6web-uat.goindigo.in/content/experience-fragments/skyplus6ev2_fragment/in/en/passenger-trip-summary/master.html"
       
        # Build payment payload
        payload = {
            "productName": "Flight",
            "channelType": "Web",
            "plateform": "Web",  # Note: API uses "plateform" (misspelled)
            "applicationName": "Customer",
            "returnUrl": return_url,
            "merchantViewUrl": merchant_view_url
        }
       
       
        # Headers from the curl command
        headers = {
            "authorization": token,
            "user_key": "2945e931b5e99bceed811fd202713432",
            "Content-Type": "application/json",
            "Origin": "https://s6web-uat.goindigo.in",
            "Referer": "https://s6web-uat.goindigo.in/",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.9"
        }
       
        try:
            logger.info(f"Initiating payment with URL: {payment_url}")
            logger.info(f"Payload: {payload}")
           
            response = requests.post(
                payment_url,
                headers=headers,
                json=payload,
                timeout=30
            )
            # print("payment response===================",response.text)
            logger.info(f"Payment response status: {response.status_code}")
           
            response.raise_for_status()
            result = response.json()
            print('payment response====================',result)
            logger.info("Payment initiation successful")
            return {
                "status": "success",
                "message": "Payment initiated successfully",
                "payment_data": result
            }
           
        except requests.HTTPError as http_err:
            try:
                error_detail = response.json()
            except Exception:
                error_detail = response.text
           
            logger.error(f"Payment initiation failed: {http_err}")
            return {
                "status": "error",
                "error": str(http_err),
                "status_code": response.status_code,
                "details": error_detail
            }
           
        except requests.Timeout:
            logger.error("Payment initiation request timed out")
            return {
                "status": "error",
                "message": "Payment initiation request timed out. Please try again.",
                "timeout": True
            }
           
        except requests.ConnectionError:
            logger.error("Connection error during payment initiation")
            return {
                "status": "error",
                "message": "Connection error during payment initiation. Please check your internet connection.",
                "connection_error": True
            }
           
        except Exception as e:
            logger.error(f"Unexpected error during payment initiation: {str(e)}")
            return {
                "status": "error",
                "message": f"Unexpected error during payment initiation: {str(e)}"
            }        
            
    # ...rest of existing code...
    # Helper function to run async tools        

    # def run_async_tool(coro):
    #     try:
    #         loop = asyncio.get_event_loop()
    #     except RuntimeError:
    #         loop = asyncio.new_event_loop()
    #         asyncio.set_event_loop(loop)
    #     return loop.run_until_complete(coro)

    # ========== End Indigo Agent Tools Integration ========== #

    # def read_prompt_instructions():
    #     """Read check-in eligibility instructions from Prompt.txt"""
    #     try:
    #         prompt_path = os.path.join(os.path.dirname(__file__), "Prompt.txt")
    #         with open(prompt_path, 'r', encoding='utf-8') as file:
    #             return file.read()
    #     except Exception as e:
    #         logger.error(f"Error reading Prompt.txt: {str(e)}")
    #         return "Default check-in eligibility validation instructions"
    
    # prompt_instructions = read_prompt_instructions()

    # validation_agnet = ChatAgent(
    #     name="CheckInEligibilityAgent",
    #     instructions=f"""Check-in Eligibility Agent: Process TOON booking data using check_in_eligibility_tool. Validate against 9 rules. Return "Eligible for Check-in" or specific failure reason.
    #     Rules: 
    #     {prompt_instructions}

    #     If all pass: "Eligible for Check-in | PNR: [recordLocator]""",
    #     chat_client=chat_client,
    #     tools=[validate_check_in_eligibility]
    # )

    # booking_agent = ChatAgent(
    #     name="BookingRetrievalAgent",
    #     instructions=dedent(
    #         """Retrieve booking data and convert to TOON format. Use booking_retrieval_tool with PNR and last name, return TOON data only."""
    #     ),
    #     description="Fetches booking information and formats it into TOON structure.",
    #     chat_client=chat_client,
    #     tools=[get_booking_information],
    # )

    main_agent = ChatAgent(
        name="indigo_flight_assistant",
         instructions=dedent("""
                You are an IndiGo Flight Upgrade Assistant.
                Always respond in a friendly, polite, and clear manner.

                Rules:
                    1. Send a Dynamic UI Form as a JSON object when user input is required. Never send the same form twice for the same step.
                    2. When sending a form, output only the JSON schema (matching the structure below), with required text.
                    3. After the user submits a form, process the input, call the appropriate tool, and send the next Dynamic UI Form if more input is needed. Otherwise, reply with a clear, friendly text message.
                    4. Never hallucinate or get confused. Only show what is required for the current step.
                    5. For greetings or general queries, reply with a friendly text message.
                    6. For upgrade requests, first send a Dynamic UI Form to collect PNR and Last Name.
                    7. After collecting and submitting the form, call the eligibility tool and send upgrade options(like DEL to BOM and BOM to MAA with submit button) as a Dynamic UI Form (checkboxes for multi-select, radio for single-select).
                    8. After upgrade selection, call the upgrade tool, then send available seats as a Dynamic UI Form (checkboxes).
                    9. After seat selection, call the seat assignment tool and reply with a friendly text confirmation and payment prompt.
                    10. Only send the payment UI after the user confirms to proceed.
                    11. Never repeat or resend the same UI form for the same step.
                    12. Never send both text and a Dynamic UI Form together—choose one based on the step.

                Form Schema Example:
                Generate JSON that matches the following schema for each form:

                {
                "id": "form-unique-id",
                "fields": [
                    {
                    "id": "pnr",
                    "type": "text",
                    "label": "PNR (Booking Reference)",
                    "placeholder": "Enter your 6-character PNR"
                    },
                    {
                    "id": "lastname",
                    "type": "text",
                    "label": "Last Name",
                    "placeholder": "Enter your last name"
                    },
                    {
                    "id": "upgradeOptions",
                    "type": "multi-select",
                    "label": "Select upgrade options",
                    "options": [
                        { "label": "Option 1", "value": "option1" },
                        { "label": "Option 2", "value": "option2" }
                    ]
                    },
                    {
                    "id": "submit",
                    "type": "button",
                    "buttonType": "submit",
                    "label": "Submit"
                    }
                ],
                "onSubmitAction": "your_action_name"
                }

                - Only output the JSON object, never TypeScript code or extra text.
                - The frontend will use this JSON to render the dynamic UI.
            """),
        description="Handles upgrade seat procedure for a PNR with strict step-based progression.",
        chat_client=chat_client,
        tools=[
            # booking_agent.as_tool(),
            # validation_agnet.as_tool(),
            generate_token,
            get_available_journeys,
            upgrade_stretch_booking,
            get_entire_seats,
            Seat_Sell,
            payment_initiate,
        ],
    )

    return AgentFrameworkAgent(
        agent=main_agent,
        name="CopilotKitMicrosoftAgentFrameworkAgent",
        require_confirmation=False,
    )