import requests
from requests.auth import HTTPBasicAuth
from datetime import datetime, timedelta, timezone

BASE_URL = "http://localhost:3001"
AUTH_USERNAME = "javier@jvha.com"
AUTH_PASSWORD = "Pass1234"
TIMEOUT = 30

def parse_datetime(dt_str):
    # Normalize datetime strings by parsing them
    # Accept with or without 'Z' suffix
    try:
        if dt_str.endswith('Z'):
            dt_str = dt_str[:-1] + '+00:00'
        return datetime.fromisoformat(dt_str)
    except Exception:
        return None

def test_admin_create_time_block_with_valid_data():
    # Step 1: Authenticate and obtain JWT token via login endpoint
    login_url = f"{BASE_URL}/api/v1/auth/login"
    login_payload = {
        "email": AUTH_USERNAME,
        "password": AUTH_PASSWORD
    }
    try:
        login_response = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert login_response.status_code == 200, f"Login failed with status {login_response.status_code}"
        login_data = login_response.json()
        token = login_data.get("token")
        assert token, "No token received after login"
    except Exception as e:
        raise AssertionError(f"Exception during login: {e}")

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Step 2: Prepare valid time block data - startTime and endTime in ISO 8601 format
    start_time_obj = (datetime.utcnow() + timedelta(hours=1)).replace(microsecond=0).replace(tzinfo=timezone.utc)
    end_time_obj = (datetime.utcnow() + timedelta(hours=2)).replace(microsecond=0).replace(tzinfo=timezone.utc)
    start_time = start_time_obj.isoformat().replace('+00:00', 'Z')
    end_time = end_time_obj.isoformat().replace('+00:00', 'Z')
    time_block_payload = {
        "startTime": start_time,
        "endTime": end_time
    }

    time_blocks_url = f"{BASE_URL}/api/v1/admin/time-blocks"

    # Step 3: Attempt to create time block with admin token
    try:
        create_response = requests.post(time_blocks_url, json=time_block_payload, headers=headers, timeout=TIMEOUT)
        assert create_response.status_code == 201, f"Expected 201 Created but got {create_response.status_code}"
        created_block = create_response.json()
        # Validate returned resource has startTime and endTime matching the request by datetime values
        resp_start = parse_datetime(created_block.get("startTime"))
        resp_end = parse_datetime(created_block.get("endTime"))
        assert resp_start is not None, "startTime missing or invalid in response"
        assert resp_end is not None, "endTime missing or invalid in response"
        # Compare datetimes ignoring formatting differences
        assert resp_start == start_time_obj, f"startTime mismatch in response: expected {start_time_obj}, got {resp_start}"
        assert resp_end == end_time_obj, f"endTime mismatch in response: expected {end_time_obj}, got {resp_end}"
        time_block_id = created_block.get("id")
        assert time_block_id, "Created time block has no id"
    except Exception as e:
        raise AssertionError(f"Exception during creating time block as admin: {e}")

    # Step 4: Negative test - attempt creation with non-admin user
    # Register and login a normal user (non-admin)
    register_url = f"{BASE_URL}/api/v1/auth/register"
    normal_user_email = "normaluser_test_tc004@example.com"
    normal_user_password = "UserPass123"
    normal_user_name = "Normal User TC004"

    try:
        # Register normal user (ignore if already exists)
        reg_payload = {
            "name": normal_user_name,
            "email": normal_user_email,
            "password": normal_user_password
        }
        reg_response = requests.post(register_url, json=reg_payload, timeout=TIMEOUT)
        # 201 Created or 400 if user already exists
        assert reg_response.status_code in (201, 400), f"Unexpected registration status: {reg_response.status_code}"
    except Exception as e:
        raise AssertionError(f"Exception during normal user registration: {e}")

    # Login normal user
    try:
        login_payload_normal = {
            "email": normal_user_email,
            "password": normal_user_password
        }
        login_response_normal = requests.post(login_url, json=login_payload_normal, timeout=TIMEOUT)
        assert login_response_normal.status_code == 200, f"Normal user login failed: {login_response_normal.status_code}"
        token_normal = login_response_normal.json().get("token")
        assert token_normal, "No token received for normal user"
    except Exception as e:
        raise AssertionError(f"Exception during normal user login: {e}")

    headers_normal = {
        "Authorization": f"Bearer {token_normal}",
        "Content-Type": "application/json"
    }

    # Attempt to create time block with normal user token - should be forbidden
    try:
        create_response_normal = requests.post(time_blocks_url, json=time_block_payload, headers=headers_normal, timeout=TIMEOUT)
        assert create_response_normal.status_code == 403, \
            f"Expected 403 Forbidden for non-admin user but got {create_response_normal.status_code}"
    except Exception as e:
        raise AssertionError(f"Exception during creating time block as non-admin user: {e}")

    # Cleanup: Delete created time block by admin
    delete_url = f"{time_blocks_url}/{time_block_id}"
    try:
        delete_response = requests.delete(delete_url, headers=headers, timeout=TIMEOUT)
        # Assume 204 No Content on successful deletion
        assert delete_response.status_code in (200, 204), f"Failed to delete time block, status {delete_response.status_code}"
    except Exception as e:
        raise AssertionError(f"Exception during cleanup deleting time block: {e}")

test_admin_create_time_block_with_valid_data()
