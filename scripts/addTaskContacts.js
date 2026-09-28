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

  assignedRef.innerHTML = "";

  for (const user of assigned) {
    assignedRef.innerHTML += await contactInitials(user);
  }
}

function validateAssign(name) {
  const contact = document.getElementById(name);

  if (!contact) return;

  contact.classList.toggle("assigned_button");
}

function resetAssigned() {
  const assignedRef = document.getElementById("assignedUser");

  assignedRef.innerHTML = "";
  assigned = [];
}