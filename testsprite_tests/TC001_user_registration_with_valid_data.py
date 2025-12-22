import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3001"
REGISTER_ENDPOINT = "/api/v1/auth/register"
LOGIN_ENDPOINT = "/api/v1/auth/login"

AUTH_USERNAME = "javier@jvha.com"
AUTH_PASSWORD = "Pass1234"
TIMEOUT = 30

def test_user_registration_with_valid_data():
    # User registration data
    user_data = {
        "name": "Test User",
        "email": "testuser_valid@example.com",
        "password": "ValidPass123"
    }

    # Headers
    headers = {
        "Content-Type": "application/json"
    }

    # Basic Auth for the request
    auth = HTTPBasicAuth(AUTH_USERNAME, AUTH_PASSWORD)

    # Register the user
    response = requests.post(
        BASE_URL + REGISTER_ENDPOINT,
        json=user_data,
        headers=headers,
        auth=auth,
        timeout=TIMEOUT
    )
    
    # Assert status code 201 Created
    assert response.status_code == 201, f"Expected status code 201, got {response.status_code}"

    # Login with the same user to verify password hashing indirectly (successful login means password was stored correctly)
    login_data = {
        "email": user_data["email"],
        "password": user_data["password"]
    }
    login_response = requests.post(
        BASE_URL + LOGIN_ENDPOINT,
        json=login_data,
        headers=headers,
        auth=auth,
        timeout=TIMEOUT
    )

    # Assert login succeeded and token returned
    assert login_response.status_code == 200, f"Expected status 200 on login, got {login_response.status_code}"
    login_json = login_response.json()
    assert "token" in login_json and isinstance(login_json["token"], str) and len(login_json["token"]) > 0, "Login response missing JWT token"

    # Cleanup: Delete the created user using login token if API supported user deletion (not specified, so skipping)

test_user_registration_with_valid_data()