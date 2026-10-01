/**
 * Loads contacts and adds them to the selection.
 * @returns {Promise<void>}
 */
async function addContactsToSelection() {
  const uid = localStorage.getItem("uid");
  const contactRef = document.getElementById("contactList");
  const contacts = await getAddTaskData("/contacts");
  const user = await getAddTaskData("/users/" + uid);
  const contactArray = Object.values(contacts || {});

  contactRef.innerHTML = "";

  await addOwnUserToSelection(contactRef, user);
  await renderContacts(contactRef, contactArray);
}

/**
 * Adds the current user to the contact selection.
 * @param {HTMLElement} contactRef - Contact list element.
 * @param {Object} user - Current user data.
 * @returns {Promise<void>}
 */
async function addOwnUserToSelection(contactRef, user) {
  const isGuest = localStorage.getItem("isGuest") === "true";

  if (isGuest || !user?.username) return;

  contactRef.innerHTML += await contactsTemplate(user, "username");
}

/**
 * Renders all contacts in the selection.
 * @param {HTMLElement} contactRef - Contact list element.
 * @param {Array} contacts - Contacts to render.
 * @returns {Promise<void>}
 */
async function renderContacts(contactRef, contacts) {
  for (const contact of contacts) {
    contactRef.innerHTML += await contactsTemplate(contact, "name");
    restoreAssignedState(contact.name);
  }
}

/**
 * Restores the assigned state of a contact.
 * @param {string} name - Contact name.
 */
function restoreAssignedState(name) {
  const isAssigned = assigned.some((user) => user.name === name);
  if (!isAssigned) return;

  const contact = document.getElementById(name);
  if (!contact) return;

  contact.classList.add("assigned_button");

  const checkbox = contact.querySelector(".subtask_checkbox");
  if (checkbox) checkbox.checked = true;
}

/**
 * Adds or removes a user from the assigned list.
 * @param {string} name - Contact name.
 * @param {string} color - Contact color.
 */
function assignedUsers(name, color) {
  const isAssigned = assigned.some((user) => user.name === name);

  if (isAssigned) {
    removeAssignedUsers(name);
    return;
  }

  addAssignedUsers(name, color);
}

/**
 * Adds a user to the assigned list.
 * @param {string} name - Contact name.
 * @param {string} color - Contact color.
 */
function addAssignedUsers(name, color) {
  assigned.push({
    name: name,
    color: color,
  });

  updateAssigned();
}

/**
 * Removes a user from the assigned list.
 * @param {string} name - Contact name.
 */
function removeAssignedUsers(name) {
  assigned = assigned.filter((user) => {
    return user.name !== name;
  });

  updateAssigned();
}

/**
 * Updates the assigned user preview.
 * @returns {Promise<void>}
 */
async function updateAssigned() {
  const assignedRef = document.getElementById("assignedUser");
  if (!assignedRef) return;

  assignedRef.innerHTML = await createAssignedPreview();
}

/**
 * Creates the assigned user preview.
 * @returns {Promise<string>} Assigned user preview HTML.
 */
async function createAssignedPreview() {
  const visibleUsers = assigned.slice(0, 3);
  let html = "";

  for (const user of visibleUsers) {
    html += await contactInitials(user);
  }

  return html + createAssignedCounter();
}

/**
 * Creates the counter for additional assigned users.
 * @returns {string} Assigned user counter HTML.
 */
function createAssignedCounter() {
  const remaining = assigned.length - 3;
  if (remaining <= 0) return "";

  return `
    <div class="contact_color assigned_counter">
      +${remaining}
    </div>
  `;
}

/**
 * Resets all assigned users.
 */
function resetAssigned() {
  assigned = [];
  clearAssignedPreview();
  resetAssignedContacts();
}

/**
 * Clears the assigned user preview.
 */
function clearAssignedPreview() {
  const assignedRef = document.getElementById("assignedUser");
  if (assignedRef) assignedRef.innerHTML = "";
}

/**
 * Resets the assigned state of all contacts.
 */
function resetAssignedContacts() {
  document.querySelectorAll(".select_contacts_option").forEach((contact) => {
    contact.classList.remove("assigned_button");
    resetAssignedCheckbox(contact);
  });
}

/**
 * Resets the checkbox of an assigned contact.
 * @param {HTMLElement} contact - Contact element.
 */
function resetAssignedCheckbox(contact) {
  const checkbox = contact.querySelector(".subtask_checkbox");
  if (checkbox) checkbox.checked = false;
}

/**
 * Restores all assigned contact states.
 */
function restoreAllAssignedStates() {
  resetAssignedContacts();

  assigned.forEach((user) => {
    restoreAssignedState(user.name);
  });
}