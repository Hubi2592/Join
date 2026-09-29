const taskList = {};
const subtaskProgressKey = "join-subtask-progress";
let isSearch = false;
let ticketAkku = [];
let draggedTicket;

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

async function getTickets(path = "") {
  const idToken = localStorage.getItem('idToken');
  let response = await fetch(baseUrl + path + ".json?auth=" + idToken);
  let responseToJson = await response.json();
  return Object.values(responseToJson);
}

async function cardColumn() {
  let myArray = await getTickets("/tickets");
  sortReference(myArray);
}

async function sortReference(reference) {
  await sort(reference);
  checkAmount("toDo");
  checkAmount("inProgress");
  checkAmount("awaitFeedback");
  checkAmount("done");
}

function dragTicket(id) {
  draggedTicket = id;
}

async function changeStatus(listKey) {
  const myArray = await getTickets("/tickets");
  const ticket = { ...myArray[draggedTicket], status: listKey };
  await putTicket("/tickets/" + draggedTicket, ticket);
  await sortReference(myArray.map((item) => (item.id === draggedTicket ? ticket : item)));
}

function allowDrop(event) {
  event.preventDefault();
}

async function sort(arr) {
  let toDo = arr.filter((t) => t["status"] == "toDo");
  let inProgress = arr.filter((t) => t["status"] == "inProgress");
  let awaitFeedback = arr.filter((t) => t["status"] == "awaitFeedback");
  let done = arr.filter((t) => t["status"] == "done");
  await updateHTML(toDo, inProgress, awaitFeedback, done);
}

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

async function updateColumn(arr, id) {
  document.getElementById(id).innerHTML = ``;
  for (let index = 0; index < arr.length; index++) {
    document.getElementById(id).innerHTML += await somethingTemplate(arr, index, id);
  }
}

async function readDatabase(arr, index, information) {
  if (arr === undefined || index === undefined || information === undefined) return "";
  return await arr[index][information];
}

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

async function readAssigned(arr, index) {
  const assignedArray = Array.isArray(arr[index]?.assigned) ? arr[index]?.assigned : [];
  let asArr = await Promise.all(assignedArray.map(async (contact) => await taskDialogNamesTemplate(contact)));
  return asArr.join("");
}

async function addInitials(arr, index) {
  const assignedArray = getAssignedUsers(arr, index);
  const visibleUsers = assignedArray.slice(0, 3);
  const initials = await createInitialsHtml(visibleUsers);

  return initials + createAssignedCounter(assignedArray.length);
}

function getAssignedUsers(arr, index) {
  if (!Array.isArray(arr[index]?.assigned)) return [];

  return arr[index].assigned;
}

async function createInitialsHtml(users) {
  const html = await Promise.all(
    users.map((user) => contactInitials(user))
  );

  return html.join("");
}

function createAssignedCounter(amount) {
  const remaining = amount - 3;
  if (remaining <= 0) return "";

  return `
    <div class="contact_color assigned_counter">
      +${remaining}
    </div>
  `;
}

function readSubtask(arr, index) {
  const safeSubtasks = Array.isArray(arr[index]?.subtasks) ? arr[index]?.subtasks : [];
  return safeSubtasks
    .map((content, subtaskIndex) =>
      taskDialogSubtasksTemplate(content, subtaskIndex, isSubtaskChecked(arr[index]?.id, subtaskIndex)),
    )
    .join("");
}

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

function validateSearch() {
  isSearch = true;
  let searchRef = document.getElementById("searchField").value;
  switch (searchRef.length) {
    case 0:
      isSearch = false;
      cardColumn();
      break;
    default:
      search(searchRef);
      break;
  }
}

async function search(input) {
  let myArray = await getTickets("/tickets");
  ticketAkku = [];
  for (let index = 0; index < myArray.length; index++) {
    for (let subindex = 0; subindex < (await myArray[index].title.length); subindex++) {
      let compare = (await myArray[index].title).slice(subindex, input.length + subindex).toLowerCase();
      if (input.toLowerCase() == compare && !ticketAkku.some((ticket) => ticket.title === myArray[index].title)) {
        ticketAkku.push(myArray[index]);
      }
    }
    for (let subindex = 0; subindex < (await myArray[index].description.length); subindex++) {
      let compare = (await myArray[index].description).slice(subindex, input.length + subindex).toLowerCase();
      if (input.toLowerCase() == compare && !ticketAkku.some((ticket) => ticket.description === myArray[index].description)) {
        ticketAkku.push(myArray[index]);
      }
    }
  }
  await sortReference(ticketAkku);
}

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

async function reduceDescription(arr, index) {
  if ((await arr[index].description.length) > 51) {
    return (await arr[index].description.slice(0, 50)) + "...";
  } else {
    return await arr[index].description;
  }
}

function stopPropagation(event) {
  event.stopPropagation();
}

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

function getSubtaskProgress() {
  try {
    return JSON.parse(localStorage.getItem(subtaskProgressKey)) || {};
  } catch {
    return {};
  }
}

function isSubtaskChecked(taskId, index) {
  return Boolean(getSubtaskProgress()[taskId]?.[index]);
}

function saveSubtaskState(taskId, index, checked) {
  const progress = getSubtaskProgress();
  progress[taskId] = progress[taskId] || {};
  progress[taskId][index] = checked;
  localStorage.setItem(subtaskProgressKey, JSON.stringify(progress));
}

async function editTaskDialog(listKey, index) {
  let arr = taskList[listKey];
  subtasks = Array.isArray(arr[index].subtasks) ? [...arr[index].subtasks] : [];
  const dialogRef = document.getElementById("dialog");
  dialogRef.classList.remove("task_board_dialog");
  dialogRef.classList.add("add_task_dialog");
  dialogRef.innerHTML = await addTaskDialogTemplate(arr, index, await readDatabase(arr, index, "status"));
  await setData(arr, index);
  const list = document.getElementById("subtasks");
  for (let subindex = 0; subindex < subtasks.length; subindex++) {
    list.innerHTML += createSubtaskTemplate(subtasks[subindex], subindex);
  }
  initialiseAddTask();
  initActionButtons(listKey);
  hideButtons();
}

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

function initialiseAddTask() {
  setupOutsideClick();
  initPriorityButtons();
  initDropdownButtons();
  initDropdownOptions();
  initSubtaskListEvents();
  addContactsToSelection();
  setMinimumDueDate();
}

async function setData(arr, index) {
  setAssigned(arr, index);
  setPriority(await readDatabase(arr, index, "priority"));
  await setCategory(arr, index);
}

async function setAssigned(arr, index) {
  const assignedRef = document.getElementById("assignedUser");
  const storedAssigned = await readDatabase(arr, index, "assigned");

  assigned = Array.isArray(storedAssigned) ? storedAssigned : [];

  if (!assignedRef) return;

  assignedRef.innerHTML = await createAssignedPreview();
}

async function setCategory(arr, index) {
  const categoryDropdown = document.getElementById("categoryDropdown");
  const categoryOption = categoryDropdown?.querySelector(`[data-value="${await readDatabase(arr, index, "category")}"]`);
  if (categoryDropdown && categoryOption) {
    updateDropdownValue(categoryDropdown, categoryOption);
  }
}

function hideButtons() {
  const clearRef = document.getElementById("clearTaskButton");
  const createRef = document.getElementById("createTaskButton");
  const editRef = document.getElementById("editTaskButton");
  clearRef.classList.toggle("hide");
  createRef.classList.toggle("hide");
  createRef.classList.toggle("highlighted_button");
  editRef.classList.toggle("hide");
}

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

async function openSpecificDialog(listKey, index, stat, reference) {
  let dialogRef = document.getElementById("dialog");
  dialogRef.innerHTML = ``;
  if (reference == "taskBoardDialog") {
    dialogRef.classList.add("task_board_dialog");
    taskDialog(listKey, index, dialogRef);
  } else {
    dialogRef.classList.add("add_task_dialog");
    dialogRef.innerHTML = await addTaskDialogTemplate(undefined, undefined, undefined);
    document.getElementById('editTaskButton').classList.add("hide");
    document.getElementById('editTaskButton').classList.remove("highlighted_button");
    initActionButtons(stat);
    setPriority("Medium");
    initialiseAddTask();
  }
  dialogRef.showModal();
  openAnimation(dialogRef);
  document.body.classList.add("dialog_open");
}

async function openSwapDialog(reference) {
  let dialogRef = document.getElementById("cardNav");
  const liRef = document.getElementById(reference);
  const rect = liRef.getBoundingClientRect();
  dialogRef.style.top = `${rect.top + 16}px`;
  dialogRef.style.left = `${rect.right - 188}px`;
  dialogRef.showModal();
  document.body.classList.toggle("dialog_open");
}

async function taskDialog(listKey, index, dialogRef) {
  let arr = taskList[listKey];
  dialogRef.dataset.taskId = arr[index].id;
  dialogRef.innerHTML = await taskDialogTemplate(arr, index, listKey);
}

async function closeSpecificDialog(reference) {
  let dialogRef = document.getElementById(reference);
  await closeAnimation(dialogRef);
  document.body.classList.remove("dialog_open");
  dialogRef.classList.remove("task_board_dialog");
  dialogRef.classList.remove("add_task_dialog");
  cardColumn();
}

function shakeAnimation(id) {
  const taskRef = document.getElementById('li' + id);
  taskRef.classList.add('shakeIt');
}