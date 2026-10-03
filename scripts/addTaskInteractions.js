/**
 * Initializes the dropdown buttons.
 */
function initDropdownButtons() {
  const buttons = document.querySelectorAll(".select_areas_toggle");
  buttons.forEach((button) => {
    button.addEventListener("click", handleDropdownClick);
  });
}

/**
 * Handles a dropdown button click.
 * @param {Event} event - Click event.
 */
function handleDropdownClick(event) {
  const dropdown = event.currentTarget.closest(".select_areas");
  if (!dropdown) return;
  toggleCustomDropdown(dropdown.id);
}

/**
 * Toggles a custom dropdown.
 * @param {string} id - Dropdown element ID.
 */
function toggleCustomDropdown(id) {
  const dropdown = document.getElementById(id);
  if (!dropdown) return;
  closeOtherDropdowns(id);
  dropdown.classList.toggle("open");
}

/**
 * Closes all dropdowns except the current one.
 * @param {string} currentId - Current dropdown ID.
 */
function closeOtherDropdowns(currentId) {
  document.querySelectorAll(".select_areas.open").forEach((dropdown) => {
    if (dropdown.id !== currentId) dropdown.classList.remove("open");
  });
}

/**
 * Initializes the dropdown options.
 */
function initDropdownOptions() {
  const options = document.querySelectorAll(".select_areas_option");
  options.forEach((option) => {
    option.addEventListener("click", handleDropdownOption);
  });
}

/**
 * Handles a dropdown option click.
 * @param {Event} event - Click event.
 */
function handleDropdownOption(event) {
  selectCustomDropdown(event.currentTarget);
}

/**
 * Selects a custom dropdown option.
 * @param {HTMLElement} optionButton - Selected option element.
 */
function selectCustomDropdown(optionButton) {
  const dropdown = optionButton.closest(".select_areas");
  if (!dropdown) return;
  updateDropdownValue(dropdown, optionButton);
  dropdown.classList.remove("open");
}

/**
 * Updates the selected dropdown value.
 * @param {HTMLElement} dropdown - Dropdown element.
 * @param {HTMLElement} optionButton - Selected option element.
 */
function updateDropdownValue(dropdown, optionButton) {
  const hiddenInput = dropdown.querySelector('input[type="hidden"]');
  const valueLabel = dropdown.querySelector(".select_areas_value");
  if (hiddenInput) hiddenInput.value = optionButton.dataset.value;
  if (valueLabel) valueLabel.textContent = optionButton.textContent.trim();
}

/**
 * Registers the outside click listener.
 */
function setupOutsideClick() {
  document.addEventListener("click", handleOutsideClick);
}

/**
 * Handles clicks outside open dropdowns.
 * @param {Event} event - Click event.
 */
function handleOutsideClick(event) {
  if (event.target.closest(".select_areas")) return;
  closeAllDropdowns();
}

/**
 * Closes all open dropdowns.
 */
function closeAllDropdowns() {
  document.querySelectorAll(".select_areas.open").forEach((dropdown) => {
    dropdown.classList.remove("open");
  });
}

/**
 * Initializes the priority buttons.
 */
function initPriorityButtons() {
  const buttons = document.querySelectorAll(".priority_button");
  buttons.forEach((button) => {
    button.addEventListener("click", handlePriorityClick);
  });
}

/**
 * Handles a priority button click.
 * @param {Event} event - Click event.
 */
function handlePriorityClick(event) {
  const priority = event.currentTarget.dataset.priority;
  setPriority(priority);
}

/**
 * Sets the selected priority.
 * @param {string} priority - Priority value.
 */
function setPriority(priority) {
  selectedPriority = priority;
  resetPriorityButtons();
  activatePriorityButton(priority);
}

/**
 * Resets all priority buttons.
 */
function resetPriorityButtons() {
  document.querySelectorAll(".priority_button").forEach((button) => {
    removePriorityClasses(button);
  });
}

/**
 * Removes active priority classes.
 * @param {HTMLElement} button - Priority button.
 */
function removePriorityClasses(button) {
  button.classList.remove(
    "priority_urgent_active",
    "priority_medium_active",
    "priority_low_active"
  );
}

/**
 * Activates the selected priority button.
 * @param {string} priority - Priority value.
 */
function activatePriorityButton(priority) {
  const button = getPriorityButton(priority);
  if (!button) return;
  button.classList.add(getPriorityClass(priority));
}

/**
 * Gets the button for a priority.
 * @param {string} priority - Priority value.
 * @returns {HTMLElement|null} Priority button.
 */
function getPriorityButton(priority) {
  return document.querySelector(`[data-priority="${priority}"]`);
}

/**
 * Gets the active class for a priority.
 * @param {string} priority - Priority value.
 * @returns {string} Priority class name.
 */
function getPriorityClass(priority) {
  if (priority === "Urgent") return "priority_urgent_active";
  if (priority === "Low") return "priority_low_active";
  return "priority_medium_active";
}

/**
 * Clears the subtask input.
 */
function removeInput() {
  const inputRef = document.getElementById("subtaskInput");
  if (!inputRef) return;
  inputRef.value = "";
}

/**
 * Adds a new subtask.
 */
function addInput() {
  const value = getSubtaskInputValue();
  if (!value) return;
  subtasks.push(value);
  renderSubtasks();
  removeInput();
}

/**
 * Gets the current subtask input value.
 * @returns {string} Subtask input value.
 */
function getSubtaskInputValue() {
  const inputRef = document.getElementById("subtaskInput");
  if (!inputRef) return "";
  return inputRef.value.trim();
}

/**
 * Renders all subtasks.
 */
function renderSubtasks() {
  const list = document.getElementById("subtasks");
  if (!list) return;
  list.innerHTML = subtasks.map(createSubtaskTemplate).join("");
}

/**
 * Initializes the subtask list events.
 */
function initSubtaskListEvents() {
  const list = document.getElementById("subtasks");
  if (!list) return;
  list.addEventListener("click", handleSubtaskListClick);
}

/**
 * Handles clicks inside the subtask list.
 * @param {Event} event - Click event.
 */
function handleSubtaskListClick(event) {
  const button = event.target.closest(".subtask_icon");
  if (!button) return;
  handleSubtaskAction(button);
}

/**
 * Handles a subtask action.
 * @param {HTMLElement} button - Subtask action button.
 */
function handleSubtaskAction(button) {
  const index = Number(button.dataset.index);
  if (button.dataset.action === "edit") beforeEditSubtask(index);
  if (button.dataset.action === "delete") deleteSubtask(index);
}

/**
 * Deletes a subtask.
 * @param {number} index - Subtask index.
 */
function deleteSubtask(index) {
  subtasks.splice(index, 1);
  renderSubtasks();
}

/**
 * Prepares a subtask for editing.
 * @param {number} index - Subtask index.
 */
function beforeEditSubtask(index) {
  const subtaskRef = document.getElementById("subtaskListItem" + index);
  const subtext = document.getElementById("subtaskName" + index).innerText;
  subtaskRef.innerHTML = subtaskEditTemplate(subtext, index);
}

/**
 * Saves an edited subtask.
 * @param {string} subtext - Input element ID.
 * @param {number} index - Subtask index.
 */
function editSubtask(subtext, index) {
  const newValue = document.getElementById(subtext).value;
  if (newValue === null) return;
  updateSubtask(index, newValue);
}

/**
 * Updates a subtask value.
 * @param {number} index - Subtask index.
 * @param {string} value - New subtask value.
 */
function updateSubtask(index, value) {
  const subtaskRef = document.getElementById("subtaskListItem" + index);
  const trimmedValue = value.trim();
  if (!trimmedValue) return;
  subtasks[index] = trimmedValue;
  subtaskRef.innerHTML = recreateSubtaskTemplate();
  renderSubtasks();
}

/**
 * Escapes HTML characters in a value.
 * @param {string} value - Value to escape.
 * @returns {string} Escaped HTML.
 */
function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

/**
 * Registers hover listeners for select areas to close dropdowns on mouse leave.
 */
function registerSelectAreaHoverListeners() {
  document.querySelectorAll('.select_areas').forEach((area) => {
    area.addEventListener('mouseleave', () => {
      area.classList.remove('open');
    });
  });
}