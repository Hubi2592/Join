function loadTasks() {
  const idToken = localStorage.getItem('idToken');
  return fetch(baseUrl + "tickets.json?auth=" + idToken)
    .then((response) => response.json())
    .then(convertTasksToArray);
}

function convertTasksToArray(data) {
  if (!data) return [];

  return Object.keys(data).map((key) => ({
    id: key,
    ...data[key],
  }));
}

function countTicketsByStatus(tickets, status) {
  return tickets.filter((ticket) => ticket.status === status).length;
}

function countUrgentTickets(tickets) {
  return tickets.filter(isUrgentAndOpen).length;
}

function isUrgentAndOpen(ticket) {
  return ticket.priority === "Urgent" && ticket.status !== "done";
}

function parseGermanDate(dateString) {
  if (!dateString) return new Date("invalid");

  const parts = dateString.split("/");
  if (parts.length !== 3) return new Date("invalid");

  return new Date(parts[2], parts[1] - 1, parts[0]);
}

function findNextDueDate(tickets) {
  const dates = getValidTicketDates(tickets);
  if (!dates.length) return "No upcoming due dates";

  const nextDate = new Date(Math.min(...dates));
  return formatDueDate(nextDate);
}

function getValidTicketDates(tickets) {
  return tickets
    .map((ticket) => parseGermanDate(ticket.date))
    .filter((date) => !isNaN(date));
}

function formatDueDate(date) {
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function countTicketsInBoard(tickets) {
  return tickets.length;
}

function renderSummaryTiles(tickets) {
  setText("todoCount", countTicketsByStatus(tickets, "toDo"));
  setText("doneCount", countTicketsByStatus(tickets, "done"));
  setText("urgentCount", countUrgentTickets(tickets));
  setText("upcomingDeadline", findNextDueDate(tickets));
  renderBottomTiles(tickets);
}

function renderBottomTiles(tickets) {
  setText("tasksInBoardCount", countTicketsInBoard(tickets));
  setText("tasksInProgressCount", countTicketsByStatus(tickets, "inProgress"));
  setText("awaitingFeedbackCount", countTicketsByStatus(tickets, "awaitFeedback"));
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (!element) return;

  element.textContent = value;
}

function loadUserGreeting(uid) {
  const idToken = localStorage.getItem('idToken');
  fetch(baseUrl + "users/" + uid + ".json?auth=" + idToken)
    .then((response) => response.json())
    .then(displayGreeting)
    .catch(handleGreetingError);
}

function handleGreetingError(error) {
  console.error("Greeting could not be loaded:", error);
}

function getTimeBasedGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";

  return "Good evening";
}

function displayGreeting(userData) {
  const user = userData || {};
  displayDesktopGreeting(user);
  displayMobileGreeting(user);
  displayProfileIcon(user);
}

function displayDesktopGreeting(user) {
  setText("greeting", getDesktopGreetingText());

  if (isGuest()) {
    setText("greetingName", "");
    return;
  }

  setText("greetingName", getUserName(user));
  setGreetingColor(user);
}

function getDesktopGreetingText() {
  const greeting = getTimeBasedGreeting();

  if (isGuest()) return greeting + "!";
  return greeting + ",";
}

function getDesktopGreetingText() {
  const greeting = getTimeBasedGreeting();

  if (isGuest()) return greeting + "!";
  return greeting + ",";
}

function setGreetingColor(user) {
  const name = document.getElementById("greetingName");
  if (!name || !user.color) return;

  name.style.color = `var(${user.color})`;
}

function displayMobileGreeting(user) {
  const greeting = document.getElementById("mobileGreetingText");
  const name = document.getElementById("mobileGreetingName");

  if (!greeting || !name) return;

  greeting.textContent = getMobileGreetingText();
  name.textContent = getMobileGreetingName(user);
  setMobileGreetingColor(name, user);
}

function setMobileGreetingColor(element, user) {
  if (isGuest() || !user.color) return;

  element.style.color = `var(${user.color})`;
}

function getMobileGreetingText() {
  if (isGuest()) return getTimeBasedGreeting() + "!";

  return getTimeBasedGreeting() + ",";
}

function getMobileGreetingName(user) {
  if (isGuest()) return "";

  return getUserName(user);
}

function getUserName(user) {
  return user.username || user.name || "";
}

function isGuest() {
  return localStorage.getItem("isGuest") === "true";
}

function displayProfileIcon(user) {
  const initial = document.getElementById("userInitial");
  if (!initial) return;

  initial.textContent = isGuest() ? "G" : getProfileInitials(user);
}

function getProfileInitials(user) {
  const name = getUserName(user).trim();
  if (!name) return "";

  return createInitials(name);
}

function createInitials(name) {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();

  return getTwoInitials(parts);
}

function getTwoInitials(parts) {
  const first = parts[0][0];
  const last = parts[parts.length - 1][0];

  return (first + last).toUpperCase();
}

function openBoard() {
  window.location.href = "../pages/board.html";
}

function registerSummaryTileEvents() {
  const tiles = document.querySelectorAll(".summary_tile");

  tiles.forEach((tile) => {
    tile.addEventListener("click", openBoard);
    tile.addEventListener("keydown", handleTileKeydown);
  });
}

function handleTileKeydown(event) {
  if (event.key !== "Enter" && event.key !== " ") return;

  event.preventDefault();
  openBoard();
}

function startMobileGreeting() {
  if (window.innerWidth >= 1024) return;

  const greeting = document.getElementById("mobileGreeting");
  const summary = document.getElementById("summaryPage");

  greeting.classList.add("mobile_greeting_active");
  summary.classList.add("mobile_summary_hidden");
  setTimeout(showMobileSummary, 1600);
}

function showMobileSummary() {
  const greeting = document.getElementById("mobileGreeting");
  const summary = document.getElementById("summaryPage");

  greeting.classList.remove("mobile_greeting_active");
  summary.classList.remove("mobile_summary_hidden");
}

function initSummary() {
  const uid = localStorage.getItem("uid");

  if (!uid) {
    window.location.href = "../index.html";
    return;
  }

  setupLogoutButton();
  initializeSummary(uid);
}

function initializeSummary(uid) {
  loadUserGreeting(uid);
  loadTasks().then(renderSummaryTiles);
  registerSummaryTileEvents();
  startMobileGreeting();
}