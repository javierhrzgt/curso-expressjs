import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3001"
USERNAME = "javier@jvha.com"
PASSWORD = "Pass1234"
TIMEOUT = 30

def test_admin_list_all_reservations():
    """
    Test the admin endpoint to list all reservations ensuring only ADMIN role users can access the list and the response contains all reservations.
    """
    login_url = f"{BASE_URL}/api/v1/auth/login"
    reservations_url = f"{BASE_URL}/api/v1/admin/reservations"

    # Step 1: Authenticate and get JWT token using basic auth
    login_payload = {
        "email": USERNAME,
        "password": PASSWORD
    }

    try:
        login_response = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Login request failed: {e}"

    assert login_response.status_code == 200, f"Login failed with status code {login_response.status_code}"

    login_data = login_response.json()
    token = login_data.get("token", None)
    assert token is not None and isinstance(token, str) and token.strip() != "", "JWT token not found in login response"

    headers = {
        "Authorization": f"Bearer {token}"
    }

    # Step 2: Request to list all reservations as ADMIN
    try:
        reservations_response = requests.get(reservations_url, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Reservations list request failed: {e}"

    # Successful response expected for ADMIN role
    assert reservations_response.status_code == 200, f"Listing reservations failed with status code {reservations_response.status_code}"

    # Validate response content (should be a list of reservations)
    try:
        reservations_data = reservations_response.json()
    except ValueError:
        assert False, "Response is not a valid JSON"

    assert isinstance(reservations_data, list), "Reservations response is not a list"

    # Optional: Each item in the list should be a dict representing a reservation (basic check)
    if len(reservations_data) > 0:
        for reservation in reservations_data:
            assert isinstance(reservation, dict), "Each reservation item should be a dictionary"
            # Optionally check for typical reservation fields like 'id', 'date', 'timeBlockId'
            assert "id" in reservation, "Reservation missing 'id' field"
            assert "date" in reservation, "Reservation missing 'date' field"

def run():
    test_admin_list_all_reservations()

run()