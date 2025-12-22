import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3001"
LOGIN_ENDPOINT = "/api/v1/auth/login"
TIMEOUT = 30


def test_user_login_with_correct_credentials():
    url = BASE_URL + LOGIN_ENDPOINT
    payload = {
        "email": "javier@jvha.com",
        "password": "Pass1234"
    }
    try:
        response = requests.post(url, json=payload, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"

    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert "token" in data, "JWT token not found in response"
    assert isinstance(data["token"], str) and len(data["token"]) > 0, "JWT token is empty or invalid"


test_user_login_with_correct_credentials()