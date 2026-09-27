const addTaskBaseUrl =
  "https://joindb-ccbc2-default-rtdb.europe-west1.firebasedatabase.app/";

let selectedPriority = "Medium";
let subtasks = [];
let assigned = [];

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
}

function redirectToLogin() {
  window.location.href = "../index.html";
}

function initAddTaskInteractions() {
  setupOutsideClick();
  initPriorityButtons();
  initDropdownButtons();
  initDropdownOptions();
  initSubtaskListEvents();
}

function setMinimumDueDate() {
  const dueDate = document.getElementById("dueDate");
  if (!dueDate) return;
  dueDate.min = getTodayDate();
}

function getTodayDate() {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const localDate = new Date(today.getTime() - offset * 60000);
  return localDate.toISOString().split("T")[0];
}

function initActionButtons(stat) {
  addClickListener("clearTaskButton", clearTaskForm);
  addClickListener("createTaskButton", (event) => createTask(event, stat));
  addClickListener("clearSubtaskButton", removeInput);
  addClickListener("addSubtaskButton", addInput);
}

function addClickListener(id, callback) {
  const button = document.getElementById(id);
  if (!button) return;
  button.addEventListener("click", callback);
}

function validateTask() {
  if (!getRequiredValues().every(Boolean)) {
    showTaskMessage("Please fill in all required fields.");
    return false;
  }
  return validateDueDate();
}

function validateDueDate() {
  const dueDate = getInputValue("dueDate");
  if (dueDate >= getTodayDate()) return true;
  showTaskMessage("Due date cannot be in the past.");
  return false;
}

function getRequiredValues() {
  return [
    getInputValue("taskTitle"),
    getInputValue("dueDate"),
    getInputValue("category"),
  ];
}

function getInputValue(id) {
  return document.getElementById(id)?.value.trim() || "";
}

async function getAddTaskData(path = "") {
  const idToken = localStorage.getItem('idToken');
  const response = await fetch(addTaskBaseUrl + path + ".json?auth=" + idToken);
  if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
  return await response.json();
}

async function getNextTaskId() {
  const tasks = await getAddTaskData("/tickets");
  if (!tasks) return 0;
  const ids = Object.keys(tasks).filter(isNumericKey).map(Number);
  if (!ids.length) return 0;
  return Math.max(...ids) + 1;
}

function isNumericKey(key) {
  return /^\d+$/.test(key);
}

async function putAddTaskData(path = "", data = {}) {
  const idToken = localStorage.getItem('idToken');
  const response = await fetch(
    addTaskBaseUrl + path + ".json?auth=" + idToken,
    getPutOptions(data)
  );
  if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
  return await response.json();
}

function getPutOptions(data) {
  return {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
}

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

async function saveTask(task) {
  await putAddTaskData(`/tickets/${task.id}`, task);
  window.location.replace("board.html");
}

function handleTaskCreationError(error) {
  console.error("Task could not be created:", error);
  showTaskMessage("Task could not be created.");
}

function showTaskMessage(text) {
  const message = document.getElementById("taskMessage");
  if (!message) return;
  message.textContent = text;
  message.classList.add("task_message_show");
  setTimeout(hideTaskMessage, 2000);
}

function hideTaskMessage() {
  const message = document.getElementById("taskMessage");
  if (!message) return;
  message.classList.remove("task_message_show");
}

function clearTaskForm() {
  clearTextInputs();
  clearHiddenInputs();
  resetDropdownLabels();
  resetSubtasks();
  setPriority("Medium");
  resetAssigned();
}

function clearTextInputs() {
  clearInput("taskTitle");
  clearInput("description");
  clearInput("dueDate");
  clearInput("subtaskInput");
}

function clearHiddenInputs() {
  clearInput("assigned");
  clearInput("category");
}

function clearInput(id) {
  const input = document.getElementById(id);
  if (input) input.value = "";
}

function resetDropdownLabels() {
  setDropdownLabel("assignedDropdown", "Select contacts to assign");
  setDropdownLabel("categoryDropdown", "Select task category");
}

function setDropdownLabel(id, text) {
  const label = document.querySelector(`#${id} .select_areas_value`);
  if (label) label.textContent = text;
}

function resetSubtasks() {
  subtasks = [];
  renderSubtasks();
}

window.initAddTask = initAddTask;