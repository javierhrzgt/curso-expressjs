import requests
from requests.auth import HTTPBasicAuth
from datetime import datetime, timedelta

BASE_URL = "http://localhost:3001"
AUTH_CREDENTIALS = ("javier@jvha.com", "Pass1234")
TIMEOUT = 30

def test_update_reservation_with_valid_changes():
    session = requests.Session()
    session.auth = HTTPBasicAuth(*AUTH_CREDENTIALS)
    headers = {"Content-Type": "application/json"}
    
    # Helper function to create a time block as admin (needed for valid timeBlockId)
    def create_time_block():
        # Admin credentials assumed (for creating time blocks)
        admin_auth = HTTPBasicAuth("admin@admin.com", "AdminPass123")  # Assuming admin exists
        start_time = datetime.utcnow() + timedelta(days=1, hours=9)
        end_time = start_time + timedelta(hours=1)
        payload = {
            "startTime": start_time.isoformat() + "Z",
            "endTime": end_time.isoformat() + "Z"
        }
        resp = requests.post(f"{BASE_URL}/api/v1/admin/time-blocks", 
                             json=payload, auth=admin_auth, timeout=TIMEOUT)
        resp.raise_for_status()
        return resp.json()["id"] if "id" in resp.json() else None

    # Create a time block to use for reservation creation and update
    time_block_id = None
    try:
        # Try to create time block for update testing
        # If admin credentials unknown/absent, fallback to get any existing time block from user reservations or skip tests
        time_block_id = create_time_block()
    except Exception:
        # If cannot create time block, skip test by raising error
        raise RuntimeError("Failed to create time block needed for test.")

    assert time_block_id is not None, "Time block ID must not be None"

    # Step 1: Create a reservation with initial date and timeBlockId
    initial_date = (datetime.utcnow() + timedelta(days=2)).replace(hour=10, minute=0, second=0, microsecond=0).isoformat() + "Z"
    reservation_payload = {
        "date": initial_date,
        "timeBlockId": time_block_id
    }
    create_resp = session.post(f"{BASE_URL}/api/v1/reservations", json=reservation_payload, headers=headers, timeout=TIMEOUT)
    assert create_resp.status_code == 201, f"Reservation creation failed: {create_resp.text}"
    reservation = create_resp.json()
    reservation_id = reservation.get("id")
    assert reservation_id is not None, "Created reservation should have an ID"

    try:
        # Step 2: Update the reservation with a new date and same timeBlockId
        updated_date = (datetime.utcnow() + timedelta(days=3)).replace(hour=11, minute=0, second=0, microsecond=0).isoformat() + "Z"
        update_payload = {
            "date": updated_date,
            "timeBlockId": time_block_id
        }
        update_resp = session.put(f"{BASE_URL}/api/v1/reservations/{reservation_id}", json=update_payload, headers=headers, timeout=TIMEOUT)
        assert update_resp.status_code == 200, f"Reservation update failed: {update_resp.text}"
        updated_reservation = update_resp.json()
        assert updated_reservation.get("date") == updated_date, "Reservation date was not updated correctly"
        assert updated_reservation.get("timeBlockId") == time_block_id, "Reservation timeBlockId was not updated correctly"

        # Step 3: Attempt unauthorized update on the reservation using another user credentials
        other_user_auth = HTTPBasicAuth("otheruser@example.com", "OtherPass123")  # Assuming this user exists and is different
        other_session = requests.Session()
        other_session.auth = other_user_auth
        other_update_resp = other_session.put(f"{BASE_URL}/api/v1/reservations/{reservation_id}", json=update_payload, headers=headers, timeout=TIMEOUT)
        assert other_update_resp.status_code in (401, 403), "Unauthorized update should be rejected"

    finally:
        # Cleanup: Delete the reservation created for the test
        del_resp = session.delete(f"{BASE_URL}/api/v1/reservations/{reservation_id}", headers=headers, timeout=TIMEOUT)
        assert del_resp.status_code == 204 or del_resp.status_code == 404, f"Failed to delete reservation: {del_resp.text}"

test_update_reservation_with_valid_changes()