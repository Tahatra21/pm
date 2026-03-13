import requests
import uuid

BASE_URL = "http://localhost:3000"
AUTH_URL = f"{BASE_URL}/api/auth"

def test_user_login_api_with_valid_credentials():
    session = requests.Session()
    email = f"testuser_{uuid.uuid4().hex}@example.com"
    password = "Password123!"
    
    # Register first
    reg_payload = {"action": "register", "name": "Test User", "email": email, "password": password}
    resp = session.post(AUTH_URL, json=reg_payload, timeout=30)
    assert resp.status_code == 201, f"Registration failed: {resp.text}"

    # Login
    login_payload = {
        "action": "login",
        "email": email,
        "password": password
    }
    response = session.post(AUTH_URL, json=login_payload, headers={'Content-Type': 'application/json'}, timeout=30)
    assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}. Body: {response.text}"
    assert "session_token" in session.cookies, "session_token cookie not found"

if __name__ == "__main__":
    test_user_login_api_with_valid_credentials()
