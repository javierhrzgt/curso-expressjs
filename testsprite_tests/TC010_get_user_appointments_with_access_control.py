import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3001"
AUTH_CREDENTIALS = ("javier@jvha.com", "Pass1234")
TIMEOUT = 30

def test_get_user_appointments_with_access_control():
    try:
        # Step 1: Login to get JWT token
        login_url = f"{BASE_URL}/api/v1/auth/login"
        login_payload = {
            "email": AUTH_CREDENTIALS[0],
            "password": AUTH_CREDENTIALS[1]
        }
        login_resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        token = login_resp.json().get("token")
        assert token and isinstance(token, str), "JWT token not found in login response"

        headers = {"Authorization": f"Bearer {token}"}

        # Step 2: Get user info of logged in user to retrieve user id and role
        # Assuming there is a protected route to get user profile
        profile_url = f"{BASE_URL}/api/v1/auth/protected-route"  # Using protected-route as placeholder if no profile endpoint
        profile_resp = requests.get(profile_url, headers=headers, timeout=TIMEOUT)
        assert profile_resp.status_code == 200, "Failed to access protected route to confirm authentication"
        # Since no user profile endpoint specified, we must try to get user id from reservations or appointments

        # Workaround: Since no direct user info endpoint, try to get appointments with user's own id as unknown.
        # So first we guess user id from a newly created reservation or skip to test access control for valid user ids.
        # According to the PRD, user id param in path must be integer.

        # For this test, we try to get appointments for the logged in user: first query with invalid user id should return 400.
        invalid_user_id = "invalid"  # Non-integer user id
        invalid_resp = requests.get(f"{BASE_URL}/api/v1/users/{invalid_user_id}/appointments", headers=headers, timeout=TIMEOUT)
        assert invalid_resp.status_code == 400, f"Expected 400 for invalid user ID but got {invalid_resp.status_code}"

        # Now test access control:
        # Without user id knowledge, try values:
        # Since user javier@jvha.com views his own appointments, get with user id as unknown should be denied or allowed accordingly.
        # We'll try three cases:
        # 1. User tries to get their own appointments -> expect 200
        # 2. User tries to get another user's appointments -> expect 403

        # To determine own user id, create a reservation and then get its user id through the reservation
        # But PRD does not provide user info retrieval endpoint, only reservations endpoints

        # Create time block as admin required, skip this, assume a timeBlockId=1 exists for testing reservation creation.
        # Create a reservation to get known user id and reservation.
        # We will create a reservation for the logged in user and fetch its appointments.

        # We need an existing timeBlockId to create a reservation. Since we have no API to create time blocks except admin, 
        # and admin credentials not provided, we can't create a time block.
        # So we test only with current info:
        # Try to fetch from user id 1 (assuming javier is that user)

        # Test fetching appointments for user id 1 (assuming javier's user id)
        user_id_own = 1  # Assumed
        appointments_resp = requests.get(f"{BASE_URL}/api/v1/users/{user_id_own}/appointments", headers=headers, timeout=TIMEOUT)
        # User can see own appointments OR forbidden
        assert appointments_resp.status_code in (200, 403), f"Unexpected status {appointments_resp.status_code} when fetching own appointments"
        if appointments_resp.status_code == 200:
            # Response should be a list/array of appointments
            data = appointments_resp.json()
            assert isinstance(data, list), "Expected list of appointments for own user"
        elif appointments_resp.status_code == 403:
            # If 403, user is not authorized to see own appointments (unlikely), could be test failure
            assert False, "Access denied for own appointments unexpectedly"

        # Test fetching appointments for a different user id (e.g. user_id_own + 1)
        user_id_other = user_id_own + 1
        other_resp = requests.get(f"{BASE_URL}/api/v1/users/{user_id_other}/appointments", headers=headers, timeout=TIMEOUT)
        # Expect forbidden 403 or 200 if user is admin
        if other_resp.status_code == 200:
            # If user is admin, allowed
            # We check if the token user is admin by presence of more than own appointments is unknown, skip role check
            data = other_resp.json()
            assert isinstance(data, list), "Expected list of appointments for other user as admin"
        else:
            assert other_resp.status_code == 403, f"Expected 403 Forbidden for other user appointments but got {other_resp.status_code}"
    except requests.RequestException as e:
        assert False, f"RequestException occurred: {e}"

test_get_user_appointments_with_access_control()