async function addContactsToSelection() {
  const uid = localStorage.getItem("uid");
  const contactRef = document.getElementById("contactList");
  const contacts = await getAddTaskData("/contacts");
  const user = await getAddTaskData("/users/" + uid);
  const contactArray = Object.values(contacts || {});

  contactRef.innerHTML = "";

  addOwnUserToSelection(contactRef, user);
  renderContacts(contactRef, contactArray);
}

async function addOwnUserToSelection(contactRef, user) {
  const isGuest = localStorage.getItem("isGuest") === "true";

  if (isGuest || !user?.username) return;

  contactRef.innerHTML += await contactsTemplate(user, "username");
}

async function renderContacts(contactRef, contacts) {
  for (const contact of contacts) {
    contactRef.innerHTML += await contactsTemplate(contact, "name");
    restoreAssignedState(contact.name);
  }
}

function restoreAssignedState(name) {
  const isAssigned = assigned.some((user) => user.name === name);

  if (isAssigned) {
    validateAssign(name);
  }
}

function assignedUsers(name, color) {
  const isAssigned = assigned.some((user) => user.name === name);

  if (isAssigned) {
    removeAssignedUsers(name);
    return;
  }

  addAssignedUsers(name, color);
}

function addAssignedUsers(name, color) {
  assigned.push({
    name: name,
    color: color,
  });

  updateAssigned();
}

function removeAssignedUsers(name) {
  assigned = assigned.filter((user) => {
    return user.name !== name;
  });

  updateAssigned();
}

async function updateAssigned() {
  const assignedRef = document.getElementById("assignedUser");
  if (!assignedRef) return;

  assignedRef.innerHTML = await createAssignedPreview();
}

async function createAssignedPreview() {
  const visibleUsers = assigned.slice(0, 3);
  let html = "";

  for (const user of visibleUsers) {
    html += await contactInitials(user);
  }

  return html + createAssignedCounter();
}

function createAssignedCounter() {
  const remaining = assigned.length - 3;
  if (remaining <= 0) return "";

  return `
    <div class="contact_color assigned_counter">
      +${remaining}
    </div>
  `;
}

function resetAssigned() {
  assigned = [];
  clearAssignedPreview();
  resetAssignedContacts();
}

function clearAssignedPreview() {
  const assignedRef = document.getElementById("assignedUser");
  if (assignedRef) assignedRef.innerHTML = "";
}

function resetAssignedContacts() {
  document.querySelectorAll(".select_contacts_option").forEach((contact) => {
    contact.classList.remove("assigned_button");
    resetAssignedCheckbox(contact);
  });
}

function resetAssignedCheckbox(contact) {
  const checkbox = contact.querySelector(".subtask_checkbox");
  if (checkbox) checkbox.checked = false;
}