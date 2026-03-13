import requests
import uuid

BASE_URL = "http://localhost:3000"
AUTH_URL = f"{BASE_URL}/api/auth"
PROJECTS_URL = f"{BASE_URL}/api/projects"
TIMEOUT = 30
STREAM_ID = "st1"

def test_update_project_api_with_valid_data():
    session = requests.Session()

    # Create a unique user for this test
    email = f"testuser_{uuid.uuid4().hex}@example.com"
    password = "Password123!"
    name = "Test User TC004"

    # Register user
    reg_payload = {"action": "register", "name": name, "email": email, "password": password}
    reg_resp = session.post(AUTH_URL, json=reg_payload, timeout=TIMEOUT)
    assert reg_resp.status_code == 201, f"Registration failed: {reg_resp.text}"
    user_id = reg_resp.json()["user"]["id"]

    # Authenticate user to obtain session cookie
    auth_payload = {"action": "login", "email": email, "password": password}
    auth_response = session.post(AUTH_URL, json=auth_payload, timeout=TIMEOUT)
    assert auth_response.status_code == 200, f"Authentication failed with status code {auth_response.status_code}"
    assert 'session_token' in session.cookies, "session_token cookie not found after login"

    # Helper function to create a new project
    def create_project():
        url = PROJECTS_URL
        project_data = {
            "title": f"Initial Project {uuid.uuid4()}",
            "description": "Initial project description",
            "color": "#0000ff",
            "streamId": STREAM_ID,
            "tags": ["tag1"], # tag1 is a valid tagId
            "members": [user_id]
        }
        resp = session.post(url, json=project_data, timeout=TIMEOUT)
        assert resp.status_code == 201, f"Project creation failed with status code {resp.status_code}. Body: {resp.text}"
        project = resp.json()
        assert "id" in project, "No project id returned on creation"
        return project["id"]

    # Helper function to delete a project by id
    def delete_project(project_id):
        url = f"{PROJECTS_URL}/{project_id}"
        resp = session.delete(url, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Project deletion failed with status code {resp.status_code}"

    project_id = create_project()

    try:
        # Prepare update data
        update_url = f"{PROJECTS_URL}/{project_id}"
        update_data = {
            "title": "Updated Project Title",
            "description": "Updated project description",
            "tags": ["tag1"] # keeping it simple with existing tag
        }
        update_headers = {"Content-Type": "application/json"}

        # Update the project
        update_response = session.put(update_url, json=update_data, headers=update_headers, timeout=TIMEOUT)
        assert update_response.status_code == 200, f"Update failed with status code {update_response.status_code}. Body: {update_response.text}"
        updated_project = update_response.json()
        assert updated_project["title"] == update_data["title"], "Project title not updated correctly"
        assert updated_project["description"] == update_data["description"], "Project description not updated correctly"

        # Verify update by fetching project details
        get_response = session.get(update_url, timeout=TIMEOUT)
        assert get_response.status_code == 200, f"Fetching updated project failed with status code {get_response.status_code}"
        project_details = get_response.json()
        assert project_details["title"] == update_data["title"], "Fetched project title mismatch after update"
        assert project_details["description"] == update_data["description"], "Fetched project description mismatch after update"

    finally:
        # Clean up: delete the created project
        delete_project(project_id)

if __name__ == "__main__":
    test_update_project_api_with_valid_data()
