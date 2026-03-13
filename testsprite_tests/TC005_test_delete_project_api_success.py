import requests
import uuid

BASE_URL = "http://localhost:3000"
AUTH_URL = f"{BASE_URL}/api/auth"
PROJECTS_URL = f"{BASE_URL}/api/projects"
TIMEOUT = 30
STREAM_ID = "st1"

# Use test credentials
TEST_EMAIL = f"testuser_{uuid.uuid4().hex}@example.com"
TEST_PASSWORD = "Password123!"
TEST_NAME = "Test User TC005"

def login_and_get_session():
    """Login to get a session cookie after registering."""
    session = requests.Session()
    # Register first
    reg_payload = {"action": "register", "name": TEST_NAME, "email": TEST_EMAIL, "password": TEST_PASSWORD}
    reg_resp = session.post(AUTH_URL, json=reg_payload, timeout=TIMEOUT)
    assert reg_resp.status_code == 201, f"Registration failed: {reg_resp.text}"

    # Login
    login_payload = {
        "action": "login",
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    }
    response = session.post(AUTH_URL, json=login_payload, headers={'Content-Type': 'application/json'}, timeout=TIMEOUT)
    assert response.status_code == 200, f"Login failed: {response.text}"
    return session


def create_project(session):
    """Create a new project for test and return its ID."""
    unique_title = f"Test Project {uuid.uuid4()}"
    project_payload = {
        "title": unique_title,
        "description": "Temporary project for deletion test",
        "color": "#ff00ff",
        "streamId": STREAM_ID,
        "members": [],
        "tags": []
    }
    response = session.post(PROJECTS_URL, json=project_payload, timeout=TIMEOUT)
    assert response.status_code == 201, f"Create project failed: {response.text}"
    project = response.json()
    project_id = project.get("id")
    assert project_id, "Created project response missing 'id'"
    return project_id


def test_delete_project_api_success():
    session = login_and_get_session()
    project_id = None
    try:
        # Create a new project for deletion test
        project_id = create_project(session)

        # Verify project exists by fetching details
        get_resp = session.get(f"{PROJECTS_URL}/{project_id}", timeout=TIMEOUT)
        assert get_resp.status_code == 200, f"Get project failed: {get_resp.text}"

        # Delete the project
        delete_resp = session.delete(f"{PROJECTS_URL}/{project_id}", timeout=TIMEOUT)
        assert delete_resp.status_code == 200 or delete_resp.status_code == 204, f"Delete project failed: {delete_resp.text}"

        # Verify deletion by attempting to get the project again
        get_after_delete_resp = session.get(f"{PROJECTS_URL}/{project_id}", timeout=TIMEOUT)
        assert get_after_delete_resp.status_code == 404, f"Project not deleted, still accessible: {get_after_delete_resp.text}"

        # Mark project_id None since already deleted
        project_id = None
    finally:
        # Cleanup in case deletion failed
        if project_id:
            session.delete(f"{PROJECTS_URL}/{project_id}", timeout=TIMEOUT)


if __name__ == "__main__":
    test_delete_project_api_success()
