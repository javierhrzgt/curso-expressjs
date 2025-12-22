import requests

BASE_URL = "http://localhost:3001"
USERNAME = "javier@jvha.com"
PASSWORD = "Pass1234"
TIMEOUT = 30

def test_access_protected_route_with_valid_token():
    login_url = f"{BASE_URL}/api/v1/auth/login"
    protected_url = f"{BASE_URL}/api/v1/auth/protected-route"

    # Step 1: Login to get a JWT token
    login_payload = {
        "email": USERNAME,
        "password": PASSWORD
    }

    try:
        login_response = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert login_response.status_code == 200, f"Expected 200 OK from login, got {login_response.status_code}"
        login_data = login_response.json()
        assert "token" in login_data, "Login response JSON does not contain 'token'"
        token = login_data["token"]
        assert isinstance(token, str) and len(token) > 0, "Received token is empty or not a string"

        headers_with_token = {"Authorization": f"Bearer {token}"}

        # Step 2: Access protected route with valid token
        protected_response = requests.get(protected_url, headers=headers_with_token, timeout=TIMEOUT)
        assert protected_response.status_code == 200, f"Expected 200 OK from protected route with valid token, got {protected_response.status_code}"

        # Step 3: Access protected route without token - should be unauthorized
        protected_response_no_token = requests.get(protected_url, timeout=TIMEOUT)
        # Expecting 401 Unauthorized or similar
        assert protected_response_no_token.status_code == 401, (
            f"Expected 401 Unauthorized from protected route without token, got {protected_response_no_token.status_code}"
        )

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_access_protected_route_with_valid_token()