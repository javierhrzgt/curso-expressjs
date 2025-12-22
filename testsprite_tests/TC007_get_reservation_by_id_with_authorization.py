import requests
import datetime
import time

BASE_URL = "http://localhost:3001"
LOGIN_URL = f"{BASE_URL}/api/v1/auth/login"
RESERVATIONS_URL = f"{BASE_URL}/api/v1/reservations"

USERNAME = "javier@jvha.com"
PASSWORD = "Pass1234"
TIMEOUT = 30

def test_get_reservation_by_id_with_authorization():
    # Step 1: Login to get JWT token
    try:
        login_resp = requests.post(
            LOGIN_URL,
            json={"email": USERNAME, "password": PASSWORD},
            timeout=TIMEOUT
        )
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        token = login_resp.json().get("token")
        assert token and isinstance(token, str), "No valid token received"
    except Exception as e:
        raise AssertionError(f"Login request failed: {str(e)}")

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Step 2: Create a time block as admin is needed for reservation, but admin credentials are unknown here.
    # Since no admin credentials given, test creation of reservation directly assuming a valid timeBlockId is known.
    # We attempt to find an existing timeBlockId by creating a reservation and deleting it after test.

    # For test purposes, pick a future date and a plausible existing timeBlockId (e.g. 1)
    # If no such id, test might fail; ideally API provides an endpoint to list time blocks.

    # We will try timeBlockId=1 here (likely for demo). Adjust if needed.
    time_block_id = 1
    reservation_date = (datetime.datetime.utcnow() + datetime.timedelta(days=1)).replace(microsecond=0).isoformat() + "Z"

    reservation_id = None
    try:
        # Create reservation to own by the user for test
        create_resp = requests.post(
            RESERVATIONS_URL,
            headers=headers,
            json={"date": reservation_date, "timeBlockId": time_block_id},
            timeout=TIMEOUT
        )
        assert create_resp.status_code == 201, f"Failed to create reservation, status {create_resp.status_code}"
        reservation_id = create_resp.json().get("id")
        assert reservation_id is not None, "Created reservation response missing id"

        # Step 3: Get reservation by ID - should succeed
        get_resp = requests.get(
            f"{RESERVATIONS_URL}/{reservation_id}",
            headers=headers,
            timeout=TIMEOUT
        )
        assert get_resp.status_code == 200, f"Failed to get reservation by ID, status {get_resp.status_code}"
        reservation_data = get_resp.json()
        assert reservation_data.get("id") == reservation_id, "Returned reservation ID mismatch"
        # Additional checks could include validating user ownership, date and timeBlockId correctness

        # Step 4: Attempt unauthorized access: No token
        get_unauth_resp = requests.get(
            f"{RESERVATIONS_URL}/{reservation_id}",
            timeout=TIMEOUT
        )
        assert get_unauth_resp.status_code in (401, 403), f"Unauthorized access allowed without token, status {get_unauth_resp.status_code}"

        # Step 5: Attempt access with invalid token
        invalid_headers = {
            "Authorization": "Bearer invalidtoken123",
            "Content-Type": "application/json"
        }
        get_invalid_token_resp = requests.get(
            f"{RESERVATIONS_URL}/{reservation_id}",
            headers=invalid_headers,
            timeout=TIMEOUT
        )
        assert get_invalid_token_resp.status_code in (401, 403), f"Access allowed with invalid token, status {get_invalid_token_resp.status_code}"

        # Step 6: Attempt access to a non-existent reservation ID (e.g. very large number)
        non_existent_id = 999999999
        get_non_exist_resp = requests.get(
            f"{RESERVATIONS_URL}/{non_existent_id}",
            headers=headers,
            timeout=TIMEOUT
        )
        assert get_non_exist_resp.status_code == 404, f"Non-existent reservation did not return 404, status {get_non_exist_resp.status_code}"

        # Step 7: Attempt access to a reservation owned by another user.
        # Since we have no info about another user or their reservation, we simulate by trying to get an ID that likely exists but not owned.
        # As a fallback, create another user and their reservation - but test plan doesn't include that.
        # So we skip explicit test for another user's reservation here due to lack of credentials/data.

    finally:
        # Cleanup: Delete the created reservation if it exists
        if reservation_id:
            try:
                delete_resp = requests.delete(
                    f"{RESERVATIONS_URL}/{reservation_id}",
                    headers=headers,
                    timeout=TIMEOUT
                )
                assert delete_resp.status_code == 204, f"Failed to delete reservation in cleanup, status {delete_resp.status_code}"
            except Exception:
                pass

test_get_reservation_by_id_with_authorization()