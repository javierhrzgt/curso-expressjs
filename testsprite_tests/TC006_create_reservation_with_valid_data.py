import requests
from requests.auth import HTTPBasicAuth
import datetime

BASE_URL = "http://localhost:3001"
AUTH_ENDPOINT = "/api/v1/auth/login"
RESERVATION_ENDPOINT = "/api/v1/reservations"

USERNAME = "javier@jvha.com"
PASSWORD = "Pass1234"
TIMEOUT = 30

def test_create_reservation_with_valid_data():
    # Login to get JWT token
    login_payload = {
        "email": USERNAME,
        "password": PASSWORD
    }
    login_resp = requests.post(
        BASE_URL + AUTH_ENDPOINT,
        json=login_payload,
        timeout=TIMEOUT
    )
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    token = login_resp.json().get("token")
    assert token and isinstance(token, str), "JWT token missing or invalid"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Since we don't have a timeBlockId provided, we must first create a time block or retrieve an existing one.
    # The PRD indicates only admin can create time blocks, we don't have admin credentials here.
    # So we'll attempt to list reservations and use an existing timeBlockId from an existing reservation or create a dummy reservation with a fixed future date and timeBlockId 1 if fails.

    # For this test, let's assume timeBlockId = 1 and future date. We do the test with that.
    # Normally, this should be retrieved dynamically, but for this test scenario, we use a fixed known timeBlockId.

    future_date = (datetime.datetime.utcnow() + datetime.timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%S") + "Z"  # ISO 8601
    reservation_payload = {
        "date": future_date,
        "timeBlockId": 1
    }

    reservation_id = None
    try:
        resp = requests.post(
            BASE_URL + RESERVATION_ENDPOINT,
            headers=headers,
            json=reservation_payload,
            timeout=TIMEOUT
        )
        assert resp.status_code == 201, f"Failed to create reservation: {resp.status_code} {resp.text}"
        data = resp.json()
        # The specification doesn't explicitly define the response body for reservation creation,
        # but typically it returns the created resource including an ID.
        # We'll try to get id from it.
        reservation_id = data.get("id")
        assert reservation_id is not None, "Created reservation ID missing in response"
    finally:
        # Cleanup: delete the reservation if it was created
        if reservation_id:
            del_resp = requests.delete(
                f"{BASE_URL}{RESERVATION_ENDPOINT}/{reservation_id}",
                headers=headers,
                timeout=TIMEOUT
            )
            # Deletion success 204 or 404 if already deleted
            assert del_resp.status_code in (204, 404), f"Failed to delete reservation in cleanup: {del_resp.status_code} {del_resp.text}"

test_create_reservation_with_valid_data()