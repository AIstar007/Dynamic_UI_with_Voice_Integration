import requests
import logging
from toon import encode
import json
import time


logging.basicConfig(level=logging.WARNING, format="%(levelname)s - %(message)s")
logger = logging.getLogger("graphql-booking-agent")

# Global token storage for reusing tokens across operations
_shared_token = None
_token_timestamp = None

def convert_to_toon(json_data):
    """
    Convert JSON data to TOON format using the toon library
    """
    try:
        if isinstance(json_data, str):
            data = json.loads(json_data)
        else:
            data = json_data

        # Use the toon library's encode function
        toon_string = encode(data)
        return toon_string

    except Exception as e:
        logger.error(f"Error converting to TOON: {str(e)}")
        return f"Error converting to TOON: {str(e)}"




def generate_graphql_authorization_token(
    base_url: str = "https://dotrezapi45-nonprod-3scale-apicast-production.apps.ocpnonprodcl01.goindigo.in",
) -> str:
    """
    Generate an authorization token specifically for GraphQL API from the Navitaire API.
    """
    endpoint = f"{base_url}/api/nsk/v2/token"

    headers = {
        "Content-Type": "application/json",
        "User-Agent": "MCP-Navitaire-Server/1.0.0",
        "user_key": "b606c5f2277c7278d0be64a600635a21",
    }

    payload = {}

    try:
        response = requests.post(
            endpoint, headers=headers, json=payload, timeout=30, verify=False
        )

        if response.status_code not in [200, 201]:
            raise requests.HTTPError(
                f"Token generation failed with status {response.status_code}: {response.text}"
            )

        token_data = response.json()

        if isinstance(token_data, dict):
            token_keys = [
                "access_token",
                "token",
                "authToken",
                "authorization_token",
                "bearer_token",
                "accessToken",
            ]

            for key in token_keys:
                if key in token_data:
                    token = token_data[key]
                    global _shared_token, _token_timestamp
                    _shared_token = token
                    _token_timestamp = time.time()
                    return token

            for key, value in token_data.items():
                if isinstance(value, dict):
                    for nested_key in token_keys:
                        if nested_key in value:
                            token = value[nested_key]
                            _shared_token = token
                            _token_timestamp = time.time()
                            return token

            for key, value in token_data.items():
                if isinstance(value, str) and len(value) > 10:
                    _shared_token = value
                    _token_timestamp = time.time()
                    return value

            raise ValueError(
                f"No valid token found in GraphQL API response. Response keys: {list(token_data.keys())}"
            )
        else:
            raise ValueError(
                f"Unexpected GraphQL API response format: {type(token_data)}"
            )

    except Exception as e:
        logger.error(f"Error during GraphQL token generation: {str(e)}")
        raise requests.RequestException(f"GraphQL token generation error: {str(e)}")


def get_or_generate_graphql_token(
    base_url: str = "https://dotrezapi45-nonprod-3scale-apicast-production.apps.ocpnonprodcl01.goindigo.in",
) -> str:
    """
    Get existing GraphQL token or generate a new one if none exists or if it's too old.
    """
    global _shared_token, _token_timestamp

    if _shared_token and _token_timestamp:
        token_age = time.time() - _token_timestamp
        if token_age < 3600:  # 1 hour - longer caching
            return _shared_token

    return generate_graphql_authorization_token(base_url)


def retrieve_booking_from_graphql_api(
    authorization_token: str,
    record_locator: str,
    last_name: str,
    query_name: str = "bookingRetrievev3",
    base_url: str = "https://dotrezapi45-nonprod-3scale-apicast-production.apps.ocpnonprodcl01.goindigo.in",
) -> dict:
    """
    Retrieve booking information from the Navitaire GraphQL API using an authorization token.
    """
    endpoint = f"{base_url}/api/v2/graph/{query_name}"

    headers = {
        "Authorization": f"Bearer {authorization_token}",
        "Content-Type": "application/json",
        "User-Agent": "MCP-Navitaire-Server/1.0.0",
        "user_key": "b606c5f2277c7278d0be64a600635a21",
    }

    graphql_query = {
        "query": "mutation BookingRetrievev3($recordLocator: String!, $lastName: String!) { \n    bookingRetrievev3(request: { recordLocator: $recordLocator, lastName: $lastName }) {\n      journeys { journeyKey segments { international passengerSegment{ key value{seats{unitKey}}} legs {legInfo{departureTimeUtc}}externalIdentifier{carrierCode}} }\n      info { paidStatus status }\n      breakdown { balanceDue }\n      passengers {\n        \n        key\n        value {\n          passengerTypeCode\n          name { title first last }\n        }\n      }\n      queues{code}\n    }\n  }",
        "variables": {"recordLocator": record_locator, "lastName": last_name},
    }

    try:
        response = requests.post(
            endpoint, headers=headers, json=graphql_query, timeout=30, verify=False
        )

        if response.status_code not in [200, 201]:
            raise requests.HTTPError(
                f"GraphQL API request failed with status {response.status_code}: {response.text}"
            )

        response_data = response.json()
        return response_data

    except Exception as e:
        logger.error(f"Error during GraphQL API request: {str(e)}")
        raise requests.RequestException(f"GraphQL API error: {str(e)}")
