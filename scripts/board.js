/**
 * These are the global variables, only used for board
 */
const taskList = {};
const subtaskProgressKey = "join-subtask-progress";
let isSearch = false;
let ticketAkku = [];
let draggedTicket;

/**
 * This functions loads all functions, relevant for the page to work
 */
function initialise() {
  const uid = localStorage.getItem("uid");
  if (!uid) {
    window.location.href = "../index.html";
    return;
  }
  loadOwnProfile(uid);
  setupLogoutButton();
  cardColumn();
}

/**
 * This function loads relevant information from the database
 */
async function getTickets(path = "") {
  const idToken = localStorage.getItem('idToken');
  let response = await fetch(baseUrl + path + ".json?auth=" + idToken);
  let responseToJson = await response.json();
  return Object.values(responseToJson);
}

/**
 * This function loads the tickets and sends the saved array for further sorting
 */
async function cardColumn() {
  let myArray = await getTickets("/tickets");
  sortReference(myArray);
}

/**
 * This function manages to let the tickets sort first before checking if they're empty
 */
async function sortReference(reference) {
  await sort(reference);
  checkAmount("toDo");
  checkAmount("inProgress");
  checkAmount("awaitFeedback");
  checkAmount("done");
}

/**
 * This function sorts the tickets, depending what status they've got
 */
async function sort(arr) {
  let toDo = arr.filter((t) => t["status"] == "toDo");
  let inProgress = arr.filter((t) => t["status"] == "inProgress");
  let awaitFeedback = arr.filter((t) => t["status"] == "awaitFeedback");
  let done = arr.filter((t) => t["status"] == "done");
  await updateHTML(toDo, inProgress, awaitFeedback, done);
}

/**
 * This function safes the content of the sorted tickets and adds these in their columns
 */
async function updateHTML(toDo, inProgress, awaitFeedback, done) {
  taskList.toDo = toDo;
  taskList.inProgress = inProgress;
  taskList.awaitFeedback = awaitFeedback;
  taskList.done = done;
  await updateColumn(taskList.toDo, "toDo");
  await updateColumn(taskList.inProgress, "inProgress");
  await updateColumn(taskList.awaitFeedback, "awaitFeedback");
  await updateColumn(taskList.done, "done");
  updateSubtaskProgress();
}

/**
 * This functions adds the ticket in its fitting column
 */
async function updateColumn(arr, id) {
  document.getElementById(id).innerHTML = ``;
  for (let index = 0; index < arr.length; index++) {
    document.getElementById(id).innerHTML += await somethingTemplate(arr, index, id);
  }
}

/**
 * This function checks if a column is empty and adds the fitting template into the column
 */
function checkAmount(id) {
  let listRef = document.getElementById(id);
  const amount = listRef.querySelectorAll("li");
  switch (id) {
    case "done":
      if (amount.length == 0) {
        listRef.innerHTML += nothingDoneTemplate();
      }
      break;
    default:
      if (amount.length == 0) {
        listRef.innerHTML += nothingTemplate();
      }
      break;
  }
}

/**
 * This function serves as returner for a precise value for templates
 */
async function readDatabase(arr, index, information) {
  if (arr === undefined || index === undefined || information === undefined) return "";
  return await arr[index][information];
}

/**
 * This function reads the priority and returns the fitting image
 */
function readPriority(priority) {
  switch (priority) {
    case "Low":
      return `<img src="../assets/img/task/low.svg" alt="Low Symbol">`;
    case "Urgent":
      return `<img src="../assets/img/task/urgent.svg" alt="Urgent Symbol">`;
    default:
      return `<img src="../assets/img/task/medium.svg" alt="Urgent Symbol">`;
  }
}

/**
 * This function reads the assigned users and adds the following template to the ticket
 */
async function readAssigned(arr, index) {
  const assignedArray = Array.isArray(arr[index]?.assigned) ? arr[index]?.assigned : [];
  let asArr = await Promise.all(assignedArray.map(async (contact) => await taskDialogNamesTemplate(contact)));
  return asArr.join("");
}

/**
 * This function adds the first three assigned users to the card of the ticket
 */
async function addInitials(arr, index) {
  const assignedArray = getAssignedUsers(arr, index);
  const visibleUsers = assignedArray.slice(0, 3);
  const initials = await createInitialsHtml(visibleUsers);
  return initials + createAssignedCount(assignedArray.length);
}

/**
 *  This function checks if there are users, assigned to a ticket
 */
function getAssignedUsers(arr, index) {
  if (!Array.isArray(arr[index]?.assigned)) return [];
  return arr[index].assigned;
}

/**
 * This function checks all assigned users and creates an icon with the initials and color of its contact
 */
async function createInitialsHtml(users) {
  const html = await Promise.all(
    users.map((user) => contactInitials(user))
  );
  return html.join("");
}

/**
 * This function adds another icon with all other assigned users combined into a single number
 */
function createAssignedCount(amount) {
  const remaining = amount - 3;
  if (remaining <= 0) return "";
  return `
    <div class="contact_color assigned_counter">+${remaining}</div>
  `;
}

/**
 * This function shortens the description in the card for better readability
 */
async function reduceDescription(arr, index) {
  if ((await arr[index].description.length) > 51) {
    return (await arr[index].description.slice(0, 50)) + "...";
  } else {
    return await arr[index].description;
  }
}

/**
 * This function checks if subtasks are available and adds them into the ticket with the following template
 */
function readSubtask(arr, index) {
  const safeSubtasks = Array.isArray(arr[index]?.subtasks) ? arr[index]?.subtasks : [];
  return safeSubtasks
    .map((content, subtaskIndex) =>
      taskDialogSubtasksTemplate(content, subtaskIndex, isSubtaskChecked(arr[index]?.id, subtaskIndex)),
    )
    .join("");
}

/**
 * This function reads all subtasks in each ticket and updates them if they are checked
 */
function updateSubtaskProgress() {
  const columns = ["toDo", "inProgress", "awaitFeedback", "done"];
  const progress = getSubtaskProgress();
  columns.forEach((column) => {
    const tasks = taskList[column] || [];
    const cards = document.querySelectorAll(`#${column} .board_card`);
    tasks.forEach((task, index) =>
      updateTaskSubtaskProgress(task, cards[index], progress),
    );
  });
}

/**
 * This function parses the status of all subtasks
 */
function getSubtaskProgress() {
    return JSON.parse(localStorage.getItem(subtaskProgressKey)) || {};
}

/**
 * This function updates the progressbar of the card
 */
function updateTaskSubtaskProgress(task, card, progress) {
  const subtasks = Array.isArray(task?.subtasks) ? task.subtasks : [];
  const progressSection = card?.querySelector(".sub_ladebalken");
  const progressBar = card?.querySelector(".ladebalken");
  const progressText = card?.querySelector(".sub_ladebalken > p");
  if (!progressSection || !progressBar || !progressText) return;
  const checkedCount = subtasks.reduce((count, _, index) => count + (progress[task.id]?.[index] ? 1 : 0), 0);
  progressSection.style.display = subtasks.length === 0 ? "none" : "";
  progressBar.style.width = `${subtasks.length ? (checkedCount / subtasks.length) * 100 : 0}px`;
  progressText.textContent = `${checkedCount}/${subtasks.length} Subtasks`;
}

/**
 * This function checks if a subtask has been checked
 */
function isSubtaskChecked(taskId, index) {
  return Boolean(getSubtaskProgress()[taskId]?.[index]);
}

/**
 * This function saves the status of the subtasks
 */
function saveSubtaskState(taskId, index, checked) {
  const progress = getSubtaskProgress();
  progress[taskId] = progress[taskId] || {};
  progress[taskId][index] = checked;
  localStorage.setItem(subtaskProgressKey, JSON.stringify(progress));
}

/**
 * This functions deletes a ticket by pushing the newer ones one id up and eradicating the last ticket
 */
async function deleteTicket(path = "") {
  const idToken = localStorage.getItem('idToken');
  const myArray = await getTickets("/tickets");
  let myTicket = await (await fetch(baseUrl + path + ".json?auth=" + idToken)).json();
  let akkumulator = myTicket.id;
  for (let index = akkumulator; index < myArray.length - 1; index++) {
    putTicket("/tickets/" + index, {
      id: index,
      title: myArray[index + 1].title,
      description: myArray[index + 1].description,
      date: myArray[index + 1].date,
      priority: myArray[index + 1].priority,
      assigned: myArray[index + 1].assigned,
      category: myArray[index + 1].category,
      subtasks: myArray[index + 1].subtasks,
      status: myArray[index + 1].status,
    });
  }
  await fetch(baseUrl + "/tickets/" + (myArray.length - 1) + ".json?auth=" + idToken, {
    method: "DELETE",
  });
  await cardColumn();
}

/**
 * This function adds updated informations about a ticket
 */
async function putTicket(path = "", data = {}) {
  const idToken = localStorage.getItem('idToken');
  await fetch(baseUrl + path + ".json?auth=" + idToken, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

/**
 * This function shows the editing dialog for updating a ticket
 */
async function editTaskDialog(listKey, index) {
  let arr = taskList[listKey];
  subtasks = Array.isArray(arr[index].subtasks) ? [...arr[index].subtasks] : [];

  const dialogRef = document.getElementById("dialog");
  dialogRef.classList.remove("task_board_dialog");
  dialogRef.classList.add("add_task_dialog");
  dialogRef.innerHTML = await addTaskDialogTemplate(
    arr,
    index,
    await readDatabase(arr, index, "status")
  );

  await initialiseAddTask();
  await setData(arr, index);
  restoreAllAssignedStates();

  const list = document.getElementById("subtasks");
  for (let subindex = 0; subindex < subtasks.length; subindex++) {
    list.innerHTML += createSubtaskTemplate(subtasks[subindex], subindex);
  }

  initActionButtons(listKey);
  hideButtons();
}

/**
 * This function takes the updated elements for the task and adds them in the ticket
 */
async function editedTask(index, listkey) {
  const arr = taskList[listkey];
  const dialogRef = document.getElementById("dialog");
  if (!validateTask()) return showValidationError();
  const id = arr[index]["id"];
  const task = collectTaskData(id, listkey);
  await saveTask(task);
  await cardColumn();
  const updatedArr = taskList[listkey];
  const updatedIndex = updatedArr.findIndex((item) => item.id === id);
  dialogRef.innerHTML = await taskDialogTemplate(updatedArr, updatedIndex, listkey);
  dialogRef.classList.add("task_board_dialog");
  dialogRef.classList.remove("add_task_dialog");
}

/**
 * This functions loads the more specific informations for the editing dialog
 */
async function setData(arr, index) {
  await setAssigned(arr, index);
  setPriority(await readDatabase(arr, index, "priority"));
  await setCategory(arr, index);
}

/**
 * This function loads the assigned users into the editing dialog
 */
async function setAssigned(arr, index) {
  const assignedRef = document.getElementById("assignedUser");
  const storedAssigned = await readDatabase(arr, index, "assigned");
  assigned = Array.isArray(storedAssigned) ? storedAssigned : [];
  if (!assignedRef) return;
  assignedRef.innerHTML = await createAssignedPreview();
}

/**
 * This function loads the category of the ticket into the editing dialog
 */
async function setCategory(arr, index) {
  const categoryDropdown = document.getElementById("categoryDropdown");
  const categoryOption = categoryDropdown?.querySelector(`[data-value="${await readDatabase(arr, index, "category")}"]`);
  if (categoryDropdown && categoryOption) {
    updateDropdownValue(categoryDropdown, categoryOption);
  }
}

/**
 * This function hides the irrelevant and show the relevant buttons from the add task dialog for editing a ticket
 */
function hideButtons() {
  const clearRef = document.getElementById("clearTaskButton");
  const createRef = document.getElementById("createTaskButton");
  const editRef = document.getElementById("editTaskButton");
  clearRef.classList.toggle("hide");
  createRef.classList.toggle("hide");
  createRef.classList.toggle("highlighted_button");
  editRef.classList.toggle("hide");
}

/**
 * This loads listeners to specific events for showing changes in real time
 */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("searchField").addEventListener("input", validateSearch);
  updateSubtaskProgress();
  document.addEventListener("change", (event) => {
    if (!event.target.classList.contains("subtask_checkbox")) return;
    const dialog = event.target.closest("dialog");
    saveSubtaskState(dialog.dataset.taskId, event.target.dataset.subtaskIndex, event.target.checked);
    updateSubtaskProgress();
  });
});
