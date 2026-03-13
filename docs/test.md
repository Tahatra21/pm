TEST FAILURE

1. TC015-Create a task using required fields and verify card is visible
    ASSERTIONS:
    - Create task modal did not appear after clicking the 'Tugas Baru' (index 959) button twice.
    - No task title input field or 'Create' button is present in the interactive elements, preventing task creation.
    - The UI elements required to complete and verify the task creation flow are not available, so the created task card cannot be rendered or confirmed.

2. TC018-Attempt to create a task with empty title and verify validation feedback
    ASSERTIONS:
    - Create task modal did not appear after multiple clicks on the 'Tugas Baru' button (interactive button present but no modal elements found).
    - 'Create' button not found on the page, so submitting a task without a title could not be attempted.
    - Validation message 'Title is required' was not observed because the modal could not be opened.
    - Notifications dropdown is visible and may be blocking or intercepting clicks on the 'Tugas Baru' button, preventing modal display.

3. TC020-My Tasks: Filter and complete a task from details view
    ASSERTIONS:
    - Task detail page did not open: clicking task title elements did not navigate to a task detail view or reveal task details.
    - Status-change action could not be completed: clicking the task status pill did not reveal a selectable status option or a control to mark the task as complete.
    - Status filter control ('Incomplete' or equivalent) could not be applied or was not found on the page to filter tasks by incomplete status.
    - Sidebar navigation to 'Tugas Saya' did not reliably work via clicks (required direct navigation to /my-tasks), indicating inconsistent navigation behavior that blocked the intended flow.

4. TC021-My Tasks: Open a task and mark it complete from details
    ASSERTIONS:
    - Task details panel did not open after clicking the task row, task title, and status badge; no task details header or fields are present in the DOM or screenshot.
    - Clicking the first task row did not navigate to or reveal a task details view; the task remains listed in the task table.
    - Quick-complete action cannot be performed because the task details view is not accessible from the task list.

5. TC022-My Tasks: Complete task and see it appear under Done/Completed filter
    ASSERTIONS:
    - Task detail panel did not open after clicking task rows (indices 1403 clicked twice and 1435 clicked once); no detail/drawer content appeared.
    - Status menu did not open after clicking the 'To Do' status label (clicks on indices 1423 and 1455); status could not be changed.
    - No visible status filter control was found on the 'Semua Tugas Saya' page to filter by 'Completed' tasks, preventing verification that a completed task becomes visible when filtering.

6. TC025-My Tasks: Task completion persists after leaving and returning to My Tasks
    ASSERTIONS:
    - Task completion control ('Mark complete' or 'Selesai') not found on the task row actions or in the task detail view, preventing marking a task as completed.
    - Clicking the task status cell/span did not change the task status; extraction after interactions shows the first task remained 'To Do'.
    - Verification of persistence after navigating away and returning could not be performed because the task could not be marked completed through the UI.

7. TC001-Register a new user successfully and get redirected to Login
    ASSERTIONS:
    - No registration success message displayed after submitting the registration form.
    - Registration did not redirect to the login page; current URL contains '/register'.

8. TC002-Registration blocked when using an existing email
    ASSERTIONS:
    - No 'email already' or equivalent validation message displayed after submitting the registration form with an existing email.
    - Application redirected away from /register to / (dashboard) after form submission instead of staying on /register.
    - Client-side required-field validation initially blocked submission due to an empty Name field on the first attempt, preventing server-side duplicate-email validation from occurring on that attempt.