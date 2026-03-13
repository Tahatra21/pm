import requests
import uuid

BASE_URL = "http://localhost:3000"
AUTH_URL = f"{BASE_URL}/api/auth"

def test_user_registration_api_with_new_email():
    unique_email = f"testuser_{uuid.uuid4().hex}@example.com"
    payload = {
        "action": "register",
        "name": "Test User",
        "email": unique_email,
        "password": "Password123!"
    }
    response = requests.post(AUTH_URL, json=payload, timeout=30)
    assert response.status_code == 201, f"Expected 201 Created, got {response.status_code}. Body: {response.text}"
    data = response.json()
    assert "user" in data, "Response doesn't contain user object"

if __name__ == "__main__":
    test_user_registration_api_with_new_email()
