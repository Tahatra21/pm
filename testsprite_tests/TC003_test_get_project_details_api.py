import requests
import uuid

BASE_URL = "http://localhost:3000"
AUTH_URL = f"{BASE_URL}/api/auth"
PROJECTS_URL = f"{BASE_URL}/api/projects"

TEST_USER_EMAIL = f"testuser_{uuid.uuid4().hex}@example.com"
TEST_USER_PASSWORD = "Password123!"
TEST_USER_NAME = "Test User TC003"
STREAM_ID = "st1" # Valid stream ID found in DB
TAG_ID = "tag1"    # Valid tag ID found in DB

def test_get_project_details_api():
    session = requests.Session()
    session.timeout = 30

    # Register user
    register_payload = {
        "action": "register",
        "name": TEST_USER_NAME,
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD
    }
    resp = session.post(AUTH_URL, json=register_payload, timeout=30)
    assert resp.status_code == 201, f"Registration failed with status {resp.status_code}. Body: {resp.text}"
    user_data = resp.json().get("user", {})
    user_id = user_data.get("id")
    assert user_id, "Registration response missing user id"

    # Login user to get session cookie
    login_payload = {
        "action": "login",
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD
    }
    login_resp = session.post(AUTH_URL, json=login_payload, timeout=30)
    assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
    assert 'session_token' in session.cookies, "No session_token cookie received"

    # Create a new project to get a valid project id
    create_project_payload = {
        "title": "Test Project TC003",
        "description": "Project created for TC003 testing",
        "color": "#ff0000",
        "members": [user_id],
        "streamId": STREAM_ID,
        "tags": [TAG_ID]
    }
    create_resp = session.post(PROJECTS_URL, json=create_project_payload, timeout=30)
    assert create_resp.status_code == 201, f"Project creation failed with status {create_resp.status_code}. Body: {create_resp.text}"
    project = create_resp.json()
    project_id = project.get("id")
    assert project_id, "Created project response missing 'id'"

    try:
        # Fetch the project details via GET /api/projects/[id]
        get_resp = session.get(f"{PROJECTS_URL}/{project_id}", timeout=30)
        assert get_resp.status_code == 200, f"Get project failed with status {get_resp.status_code}"
        data = get_resp.json()

        # Assert required fields
        assert data["title"] == create_project_payload["title"], f"Title mismatch: {data.get('title')}"
        assert data["description"] == create_project_payload["description"], "Description mismatch"
        assert user_id in data["members"], "User ID not in members"
        assert TAG_ID in data["tags"], "Tag ID not in tags"
        assert "progress" in data, "Missing progress field"
        assert "taskCount" in data, "Missing taskCount field"

    finally:
        # Cleanup: delete the created project
        del_resp = session.delete(f"{PROJECTS_URL}/{project_id}", timeout=30)
        assert del_resp.status_code in (200, 204), f"Failed to delete project with status {del_resp.status_code}"

if __name__ == "__main__":
    test_get_project_details_api()
