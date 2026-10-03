const addTaskBaseUrl =
  "https://joindb-ccbc2-default-rtdb.europe-west1.firebasedatabase.app/";

let selectedPriority = "Medium";
let subtasks = [];
let assigned = [];

/**
 * Initializes the add task page.
 */
function initAddTask() {
  const uid = localStorage.getItem("uid");
  if (!uid) return redirectToLogin();
  loadOwnProfile(uid);
  initAddTaskInteractions();
  addContactsToSelection();
  initActionButtons("toDo");
  setPriority("Medium");
  setMinimumDueDate();
  setupLogoutButton();
  registerSelectAreaHoverListeners();
}

/**
 * Redirects to the login page.
 */
function redirectToLogin() {
  window.location.href = "../index.html";
}

/**
 * Initializes all add task interactions.
 */
function initAddTaskInteractions() {
  setupOutsideClick();
  initPriorityButtons();
  initDropdownButtons();
  initDropdownOptions();
  initSubtaskListEvents();
}

/**
 * Sets the minimum selectable due date.
 */
function setMinimumDueDate() {
  const dueDate = document.getElementById("dueDate");
  if (!dueDate) return;
  dueDate.min = getTodayDate();
}

/**
 * Returns today's local date.
 * @returns {string} Date in YYYY-MM-DD format.
 */
function getTodayDate() {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const localDate = new Date(today.getTime() - offset * 60000);
  return localDate.toISOString().split("T")[0];
}

/**
 * Initializes the task action buttons.
 * @param {string} stat - Initial task status.
 */
function initActionButtons(stat) {
  addClickListener("clearTaskButton", clearTaskForm);
  addClickListener("createTaskButton", (event) => createTask(event, stat));
  addClickListener("clearSubtaskButton", removeInput);
  addClickListener("addSubtaskButton", addInput);
}

/**
 * Adds a click listener to an element.
 * @param {string} id - Element ID.
 * @param {Function} callback - Click handler.
 */
function addClickListener(id, callback) {
  const button = document.getElementById(id);
  if (!button) return;
  button.addEventListener("click", callback);
}

/**
 * Validates the required task fields.
 * @returns {boolean} Whether the task is valid.
 */
function validateTask() {
  if (!getRequiredValues().every(Boolean)) {
    showTaskMessage("Please fill in all required fields.");
    return false;
  }
  return validateDueDate();
}

/**
 * Validates the selected due date.
 * @returns {boolean} Whether the due date is valid.
 */
function validateDueDate() {
  const dueDate = getInputValue("dueDate");
  if (dueDate >= getTodayDate()) return true;
  showTaskMessage("Due date cannot be in the past.");
  return false;
}

/**
 * Gets all required task values.
 * @returns {Array<string>} Required field values.
 */
function getRequiredValues() {
  return [
    getInputValue("taskTitle"),
    getInputValue("dueDate"),
    getInputValue("category"),
  ];
}

/**
 * Gets the trimmed value of an input.
 * @param {string} id - Input element ID.
 * @returns {string} Input value.
 */
function getInputValue(id) {
  return document.getElementById(id)?.value.trim() || "";
}

/**
 * Loads add task data from Firebase.
 * @param {string} path - Firebase database path.
 * @returns {Promise<Object|null>} Loaded data.
 */
async function getAddTaskData(path = "") {
  const idToken = localStorage.getItem('idToken');
  const response = await fetch(addTaskBaseUrl + path + ".json?auth=" + idToken);
  if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
  return await response.json();
}

/**
 * Returns the next available task ID.
 * @returns {Promise<number>} Next task ID.
 */
async function getNextTaskId() {
  const tasks = await getAddTaskData("/tickets");
  if (!tasks) return 0;
  const ids = Object.keys(tasks).filter(isNumericKey).map(Number);
  if (!ids.length) return 0;
  return Math.max(...ids) + 1;
}

/**
 * Checks whether a key is numeric.
 * @param {string} key - Key to check.
 * @returns {boolean} Whether the key is numeric.
 */
function isNumericKey(key) {
  return /^\d+$/.test(key);
}

/**
 * Writes add task data to Firebase.
 * @param {string} path - Firebase database path.
 * @param {Object} data - Data to save.
 * @returns {Promise<Object|null>} Firebase response data.
 */
async function putAddTaskData(path = "", data = {}) {
  const idToken = localStorage.getItem('idToken');
  const response = await fetch(
    addTaskBaseUrl + path + ".json?auth=" + idToken,
    getPutOptions(data)
  );
  if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
  return await response.json();
}

/**
 * Creates options for a Firebase PUT request.
 * @param {Object} data - Data to send.
 * @returns {Object} Fetch options.
 */
function getPutOptions(data) {
  return {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
}

/**
 * Creates and saves a new task.
 * @param {Event} event - Submit event.
 * @param {string} stat - Task status.
 * @returns {Promise<void>}
 */
async function createTask(event, stat) {
  event.preventDefault();
  if (!validateTask()) return;
  try {
    const id = await getNextTaskId();
    const task = collectTaskData(id, stat);
    await saveTask(task);
  } catch (error) {
    handleTaskCreationError(error);
  }
}

/**
 * Collects the data for a new task.
 * @param {number} id - Task ID.
 * @param {string} stat - Task status.
 * @returns {Object} Task data.
 */
function collectTaskData(id, stat) {
  return {
    id: id,
    title: getInputValue("taskTitle"),
    description: getInputValue("description"),
    date: getInputValue("dueDate"),
    priority: selectedPriority,
    assigned: assigned,
    category: getInputValue("category"),
    subtasks: [...subtasks],
    status: stat,
  };
}

/**
 * Saves a task and opens the board.
 * @param {Object} task - Task data.
 * @returns {Promise<void>}
 */
async function saveTask(task) {
  await putAddTaskData(`/tickets/${task.id}`, task);
  window.location.replace("board.html");
}

/**
 * Handles errors while creating a task.
 * @param {Error} error - Task creation error.
 */
function handleTaskCreationError(error) {
  console.error("Task could not be created:", error);
  showTaskMessage("Task could not be created.");
}

/**
 * Displays a temporary task message.
 * @param {string} text - Message to display.
 */
function showTaskMessage(text) {
  const message = document.getElementById("taskMessage");
  if (!message) return;
  message.textContent = text;
  message.classList.add("task_message_show");
  setTimeout(hideTaskMessage, 2000);
}

/**
 * Hides the task message.
 */
function hideTaskMessage() {
  const message = document.getElementById("taskMessage");
  if (!message) return;
  message.classList.remove("task_message_show");
}

/**
 * Resets the complete task form.
 */
function clearTaskForm() {
  clearTextInputs();
  clearHiddenInputs();
  resetDropdownLabels();
  resetSubtasks();
  setPriority("Medium");
  resetAssigned();
}

/**
 * Clears all text inputs.
 */
function clearTextInputs() {
  clearInput("taskTitle");
  clearInput("description");
  clearInput("dueDate");
  clearInput("subtaskInput");
}

/**
 * Clears all hidden inputs.
 */
function clearHiddenInputs() {
  clearInput("assigned");
  clearInput("category");
}

/**
 * Clears an input value.
 * @param {string} id - Input element ID.
 */
function clearInput(id) {
  const input = document.getElementById(id);
  if (input) input.value = "";
}

/**
 * Resets the dropdown labels.
 */
function resetDropdownLabels() {
  setDropdownLabel("assignedDropdown", "Select contacts to assign");
  setDropdownLabel("categoryDropdown", "Select task category");
}

/**
 * Sets the text of a dropdown label.
 * @param {string} id - Dropdown element ID.
 * @param {string} text - Label text.
 */
function setDropdownLabel(id, text) {
  const label = document.querySelector(`#${id} .select_areas_value`);
  if (label) label.textContent = text;
}

/**
 * Clears all subtasks.
 */
function resetSubtasks() {
  subtasks = [];
  renderSubtasks();
}

/**
 * Guides validation to correct function
 */
function validateInput(id) {
  const input = document.getElementById(id);
  const value = input.value.trim();
  const error = document.getElementById(id+"Error");
  switch (id) {
    case 'dueDate':
      validateDate(input, value, error);
      break;
    case 'category':
      validateCategory(document.getElementById('selectAreaCategory'), value, error);
      break;
    default:
      validateTitle(input, value, error);
      break;
  }
}

/**
 * Checks if content of title is acceptable
 */
function validateTitle(input, value, error) {
  if (value.length === 0) {
    error.classList.remove('hide');
    input.classList.add('input_error');
  }
  else {
    error.classList.add('hide');
    input.classList.remove('input_error');
  }
}

/**
 * Checks if content of category is acceptable
 */
function validateCategory(input, value, error) {
  if (value.length === 0) {
    error.classList.remove('hide');
    input.classList.add('input_error');
  } else {
    error.classList.add('hide');
    input.classList.remove('input_error');
  }
}

/**
 * Checks if content of date is acceptable
 */
function validateDate(input, value, error) {
  if (value.length === 0 || value < getTodayDate()) {
    error.classList.remove('hide');
    input.classList.add('input_error');
  }
  else {
    error.classList.add('hide');
    input.classList.remove('input_error');
  }
}

window.initAddTask = initAddTask;