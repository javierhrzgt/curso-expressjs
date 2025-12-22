import requests
import datetime
import traceback

BASE_URL = "http://localhost:3001"
AUTH_CREDENTIALS = ("javier@jvha.com", "Pass1234")
TIMEOUT = 30

def test_delete_reservation_by_owner_user():
    session = requests.Session()
    # Authenticate user to get JWT token
    try:
        login_resp = session.post(
            f"{BASE_URL}/api/v1/auth/login",
            json={"email": AUTH_CREDENTIALS[0], "password": AUTH_CREDENTIALS[1]},
            timeout=TIMEOUT,
        )
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        token = login_resp.json().get("token")
        assert token, "No token returned from login"
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get list of user's own reservations to find a reservation to delete
        # Since no direct endpoint provided, create one for testing:
        # Create a time block as admin for reservation creation - Not required, use fixed timeBlockId=1 for test if exists
        # Assumption: timeBlockId=1 exists and is available, else get one by listing or failing test.
        
        # Create a reservation to ensure we have one owned by user
        reservation_payload = {
            "date": (datetime.datetime.utcnow() + datetime.timedelta(days=1)).isoformat() + "Z",
            "timeBlockId": 1
        }
        create_resp = session.post(
            f"{BASE_URL}/api/v1/reservations",
            headers=headers,
            json=reservation_payload,
            timeout=TIMEOUT,
        )
        assert create_resp.status_code == 201, f"Failed to create reservation: {create_resp.text}"
        reservation = create_resp.json()
        reservation_id = reservation.get("id")
        assert reservation_id is not None, "Created reservation ID missing"
        
        try:
            # Now delete the reservation as its owner
            delete_resp = session.delete(
                f"{BASE_URL}/api/v1/reservations/{reservation_id}",
                headers=headers,
                timeout=TIMEOUT,
            )
            assert delete_resp.status_code == 204, f"Failed to delete reservation: {delete_resp.text}"

            # Verify the reservation no longer exists
            get_resp = session.get(
                f"{BASE_URL}/api/v1/reservations/{reservation_id}",
                headers=headers,
                timeout=TIMEOUT,
            )
            assert get_resp.status_code == 404, "Deleted reservation still accessible"

            # Attempt unauthorized deletion - try to delete another user's reservation id=999999 assuming it exists
            # We expect 404 or 403; 404 is per API spec for not found
            unauthorized_delete_resp = session.delete(
                f"{BASE_URL}/api/v1/reservations/999999",
                headers=headers,
                timeout=TIMEOUT,
            )
            assert unauthorized_delete_resp.status_code in (403, 404), f"Unauthorized deletion did not reject properly: {unauthorized_delete_resp.status_code}"
        
        finally:
            # Cleanup: in case deletion did not succeed above, attempt to delete the reservation
            session.delete(
                f"{BASE_URL}/api/v1/reservations/{reservation_id}",
                headers=headers,
                timeout=TIMEOUT,
            )
    except Exception:
        traceback.print_exc()
        raise
    finally:
        session.close()

test_delete_reservation_by_owner_user()