/**
 * Loads all tasks from Firebase.
 * @returns {Promise<Array>} Loaded tasks.
 */
function loadTasks() {
  const idToken = localStorage.getItem('idToken');
  return fetch(baseUrl + "tickets.json?auth=" + idToken)
    .then((response) => response.json())
    .then(convertTasksToArray);
}

/**
 * Converts Firebase task data into an array.
 * @param {Object|null} data - Firebase task data.
 * @returns {Array} Task array.
 */
function convertTasksToArray(data) {
  if (!data) return [];

  return Object.keys(data).map((key) => ({
    id: key,
    ...data[key],
  }));
}

/**
 * Counts tasks with a specific status.
 * @param {Array} tickets - Tasks to count.
 * @param {string} status - Task status.
 * @returns {number} Number of matching tasks.
 */
function countTicketsByStatus(tickets, status) {
  return tickets.filter((ticket) => ticket.status === status).length;
}

/**
 * Counts open urgent tasks.
 * @param {Array} tickets - Tasks to count.
 * @returns {number} Number of urgent tasks.
 */
function countUrgentTickets(tickets) {
  return tickets.filter(isUrgentAndOpen).length;
}

/**
 * Checks whether a task is urgent and open.
 * @param {Object} ticket - Task data.
 * @returns {boolean} Whether the task is urgent and open.
 */
function isUrgentAndOpen(ticket) {
  return ticket.priority === "Urgent" && ticket.status !== "done";
}

/**
 * Converts a German date string into a Date object.
 * @param {string} dateString - Date in DD/MM/YYYY format.
 * @returns {Date} Parsed date.
 */
function parseGermanDate(dateString) {
  if (!dateString) return new Date("invalid");

  const parts = dateString.split("-");
  if (parts.length !== 3) return new Date("invalid");

  return new Date(parts[0], parts[1]-1, parts[2]);
}

/**
 * Finds the next task due date.
 * @param {Array} tickets - Task data.
 * @returns {string} Next due date.
 */
function findNextDueDate(tickets) {
  const dates = getValidTicketDates(tickets);
  if (!dates.length) return "No upcoming due dates";

  const nextDate = new Date(Math.min(...dates));
  return formatDueDate(nextDate);
}

/**
 * Gets all valid task due dates.
 * @param {Array} tickets - Task data.
 * @returns {Array<Date>} Valid task dates.
 */
function getValidTicketDates(tickets) {
  return tickets
    .map((ticket) => parseGermanDate(ticket.date))
    .filter((date) => !isNaN(date));
}

/**
 * Formats a due date for display.
 * @param {Date} date - Date to format.
 * @returns {string} Formatted date.
 */
function formatDueDate(date) {
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Counts all tasks on the board.
 * @param {Array} tickets - Task data.
 * @returns {number} Number of tasks.
 */
function countTicketsInBoard(tickets) {
  return tickets.length;
}

/**
 * Renders the summary tile values.
 * @param {Array} tickets - Task data.
 */
function renderSummaryTiles(tickets) {
  setText("todoCount", countTicketsByStatus(tickets, "toDo"));
  setText("doneCount", countTicketsByStatus(tickets, "done"));
  setText("urgentCount", countUrgentTickets(tickets));
  setText("upcomingDeadline", findNextDueDate(tickets));
  renderBottomTiles(tickets);
}

/**
 * Renders the bottom summary tiles.
 * @param {Array} tickets - Task data.
 */
function renderBottomTiles(tickets) {
  setText("tasksInBoardCount", countTicketsInBoard(tickets));
  setText("tasksInProgressCount", countTicketsByStatus(tickets, "inProgress"));
  setText("awaitingFeedbackCount", countTicketsByStatus(tickets, "awaitFeedback"));
}

/**
 * Sets the text content of an element.
 * @param {string} id - Element ID.
 * @param {string|number} value - Value to display.
 */
function setText(id, value) {
  const element = document.getElementById(id);
  if (!element) return;

  element.textContent = value;
}

/**
 * Loads the user data for the greeting.
 * @param {string} uid - Current user ID.
 */
function loadUserGreeting(uid) {
  const idToken = localStorage.getItem('idToken');
  fetch(baseUrl + "users/" + uid + ".json?auth=" + idToken)
    .then((response) => response.json())
    .then(displayGreeting)
    .catch(handleGreetingError);
}

/**
 * Handles errors while loading the greeting.
 * @param {Error} error - Loading error.
 */
function handleGreetingError(error) {
  console.error("Greeting could not be loaded:", error);
}

/**
 * Returns a greeting based on the current time.
 * @returns {string} Time-based greeting.
 */
function getTimeBasedGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";

  return "Good evening";
}

/**
 * Displays the user greeting and profile icon.
 * @param {Object|null} userData - Current user data.
 */
function displayGreeting(userData) {
  const user = userData || {};
  displayDesktopGreeting(user);
  displayMobileGreeting(user);
  displayProfileIcon(user);
}

/**
 * Displays the desktop greeting.
 * @param {Object} user - Current user data.
 */
function displayDesktopGreeting(user) {
  setText("greeting", getDesktopGreetingText());

  if (isGuest()) {
    setText("greetingName", "");
    return;
  }

  setText("greetingName", getUserName(user));
  setGreetingColor(user);
}

/**
 * Returns the desktop greeting text.
 * @returns {string} Desktop greeting.
 */
function getDesktopGreetingText() {
  const greeting = getTimeBasedGreeting();

  if (isGuest()) return greeting + "!";
  return greeting + ",";
}

/**
 * Sets the greeting name color.
 * @param {Object} user - Current user data.
 */
function setGreetingColor(user) {
  const name = document.getElementById("greetingName");
  if (!name || !user.color) return;

  name.style.color = `var(${user.color})`;
}

/**
 * Displays the mobile greeting.
 * @param {Object} user - Current user data.
 */
function displayMobileGreeting(user) {
  const greeting = document.getElementById("mobileGreetingText");
  const name = document.getElementById("mobileGreetingName");

  if (!greeting || !name) return;

  greeting.textContent = getMobileGreetingText();
  name.textContent = getMobileGreetingName(user);
  setMobileGreetingColor(name, user);
}

/**
 * Sets the mobile greeting name color.
 * @param {HTMLElement} element - Greeting name element.
 * @param {Object} user - Current user data.
 */
function setMobileGreetingColor(element, user) {
  if (isGuest() || !user.color) return;

  element.style.color = `var(${user.color})`;
}

/**
 * Returns the mobile greeting text.
 * @returns {string} Mobile greeting.
 */
function getMobileGreetingText() {
  if (isGuest()) return getTimeBasedGreeting() + "!";

  return getTimeBasedGreeting() + ",";
}

/**
 * Returns the mobile greeting name.
 * @param {Object} user - Current user data.
 * @returns {string} User name or an empty string.
 */
function getMobileGreetingName(user) {
  if (isGuest()) return "";

  return getUserName(user);
}

/**
 * Gets the user's display name.
 * @param {Object} user - Current user data.
 * @returns {string} User name.
 */
function getUserName(user) {
  return user.username || user.name || "";
}

/**
 * Checks whether the current user is a guest.
 * @returns {boolean} Whether the user is a guest.
 */
function isGuest() {
  return localStorage.getItem("isGuest") === "true";
}

/**
 * Displays the profile initials.
 * @param {Object} user - Current user data.
 */
function displayProfileIcon(user) {
  const initial = document.getElementById("userInitial");
  if (!initial) return;

  initial.textContent = isGuest() ? "G" : getProfileInitials(user);
}

/**
 * Gets the user's profile initials.
 * @param {Object} user - Current user data.
 * @returns {string} User initials.
 */
function getProfileInitials(user) {
  const name = getUserName(user).trim();
  if (!name) return "";

  return createInitials(name);
}

/**
 * Creates initials from a name.
 * @param {string} name - User name.
 * @returns {string} User initials.
 */
function createInitials(name) {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();

  return getTwoInitials(parts);
}

/**
 * Creates initials from the first and last name parts.
 * @param {Array} parts - Name parts.
 * @returns {string} Two initials.
 */
function getTwoInitials(parts) {
  const first = parts[0][0];
  const last = parts[parts.length - 1][0];

  return (first + last).toUpperCase();
}

/**
 * Opens the board page.
 */
function openBoard() {
  window.location.href = "../pages/board.html";
}

/**
 * Registers events for the summary tiles.
 */
function registerSummaryTileEvents() {
  const tiles = document.querySelectorAll(".summary_tile");

  tiles.forEach((tile) => {
    tile.addEventListener("click", openBoard);
    tile.addEventListener("keydown", handleTileKeydown);
  });
}

/**
 * Handles keyboard interaction with summary tiles.
 * @param {KeyboardEvent} event - Keyboard event.
 */
function handleTileKeydown(event) {
  if (event.key !== "Enter" && event.key !== " ") return;

  event.preventDefault();
  openBoard();
}

/**
 * Starts the mobile greeting animation.
 */
function startMobileGreeting() {
  if (window.innerWidth >= 1024) return;

  const greeting = document.getElementById("mobileGreeting");
  const summary = document.getElementById("summaryPage");

  greeting.classList.add("mobile_greeting_active");
  summary.classList.add("mobile_summary_hidden");
  setTimeout(showMobileSummary, 1600);
}

/**
 * Hides the mobile greeting and shows the summary.
 */
function showMobileSummary() {
  const greeting = document.getElementById("mobileGreeting");
  const summary = document.getElementById("summaryPage");

  greeting.classList.remove("mobile_greeting_active");
  summary.classList.remove("mobile_summary_hidden");
}

/**
 * Initializes the summary page.
 */
function initSummary() {
  const uid = localStorage.getItem("uid");

  if (!uid) {
    window.location.href = "../index.html";
    return;
  }

  setupLogoutButton();
  initializeSummary(uid);
}

/**
 * Loads and initializes the summary content.
 * @param {string} uid - Current user ID.
 */
function initializeSummary(uid) {
  loadUserGreeting(uid);
  loadTasks().then(renderSummaryTiles);
  registerSummaryTileEvents();
  startMobileGreeting();
}