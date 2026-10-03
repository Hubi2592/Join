/**
 * This function saves the number of the dragged ticket
 */
function dragTicket(id, event) {
  draggedTicket = id;
  event.currentTarget.classList.add("dragging");
}

/**
 * This function switches the status of the ticket
 */
async function changeStatus(listKey) {
  clearDropFeedback();
  const myArray = await getTickets("/tickets");
  const ticket = { ...myArray[draggedTicket], status: listKey };
  await putTicket("/tickets/" + draggedTicket, ticket);
  await sortReference(myArray.map((item) => item.id === draggedTicket ? ticket : item));
}

/**
 * This function shows where to put the dragged ticket
 */
function allowDrop(event) {
  event.preventDefault();
  const column = event.currentTarget;
  clearDropFeedback();
  if (column.id === getDraggedStatus()) {
    column.classList.add("drop_not_allowed");
    return;
  }
  column.classList.add("drop_allowed");
}

/**
 * This function loads the status of the dragged task
 */
function getDraggedStatus() {
  for (const key of Object.keys(taskList)) {
    const found = taskList[key].some((task) => task.id === draggedTicket);
    if (found) return key;
  }
  return "";
}

/**
 * This function removes the classes for the columns to show where to drop tickets
 */
function clearDropFeedback() {
  document.querySelectorAll(".column").forEach((column) => {
    column.classList.remove("drop_allowed");
    column.classList.remove("drop_not_allowed");
  });
}

/**
 * This function ends the dragging event
 */
function handleDragEnd(event) {
  event.currentTarget.classList.remove("dragging");
  clearDropFeedback();
}

/**
 * This function adds an animation if the ticket is dragged
 */
function shakeAnimation(id) {
  const taskRef = document.getElementById('li' + id);
  taskRef.classList.add('shakeIt');
}

/**
 * This function checks if something is written in the search bar
 */
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

/**
 * This function checks if the input of the search bar fits to the existing tickets
 */
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

/**
 * This function opens a ticket or the add task dialog
 */
async function openSpecificDialog(listKey, index, stat, reference) {
  let dialogRef = document.getElementById("dialog");
  dialogRef.innerHTML = ``;
  if (reference == "taskBoardDialog") {
    dialogRef.classList.add("task_board_dialog");
    taskDialog(listKey, index, dialogRef);
  } else {
    dialogRef.classList.add("add_task_dialog");
    dialogRef.innerHTML = await addTaskDialogTemplate(undefined, undefined, undefined);
    document.getElementById('editTaskButton').classList.add('hide');
    document.getElementById('editTaskButton').classList.remove("highlighted_button");
    initActionButtons(stat);
    setPriority("Medium");
    initialiseAddTask();
  }
  dialogRef.showModal();
  openAnimation(dialogRef);
  document.body.classList.add("dialog_open");
}

/**
 * This function open the add task dialog if the user clicks on one of the buttons for the columns
 */
async function taskDialog(listKey, index, dialogRef) {
  let arr = taskList[listKey];
  dialogRef.dataset.taskId = arr[index].id;
  dialogRef.innerHTML = await taskDialogTemplate(arr, index, listKey);
}

/**
 * This function opens a dialog for the mobile version to change status of a ticket
 */
async function openSwapDialog(reference) {
  let dialogRef = document.getElementById("cardNav");
  const liRef = document.getElementById(reference);
  const rect = liRef.getBoundingClientRect();
  dialogRef.style.top = `${rect.top + 16}px`;
  dialogRef.style.left = `${rect.right - 188}px`;
  dialogRef.showModal();
  document.body.classList.toggle("dialog_open");
}

/**
 * This function closes the ticket or the add task dialog
 */
async function closeSpecificDialog(reference) {
  let dialogRef = document.getElementById(reference);
  await closeAnimation(dialogRef);
  document.body.classList.remove("dialog_open");
  dialogRef.classList.remove("task_board_dialog");
  dialogRef.classList.remove("add_task_dialog");
  cardColumn();
}

/**
 * This function disables event bubbling
 */
function stopPropagation(event) {
  event.stopPropagation();
}

/**
 * This function loads all relevant functions from add task, necessary for the same called dialog
 */
async function initialiseAddTask() {
  setupOutsideClick();
  initPriorityButtons();
  initDropdownButtons();
  initDropdownOptions();
  initSubtaskListEvents();
  await addContactsToSelection();
  setMinimumDueDate();
  registerSelectAreaHoverListeners();
}
