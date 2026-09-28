async function addContactsToSelection() {
  const uid = localStorage.getItem("uid");
  const contactRef = document.getElementById("contactList");
  const contacts = await getAddTaskData("/users/" + uid + "/contacts");
  const user = await getAddTaskData("/users/" + uid);
  const contactArray = Object.values(contacts || {});
  contactRef.innerHTML = await contactsTemplate(user, "username");
  renderContacts(contactRef, contactArray);
}

async function renderContacts(contactRef, contacts) {
  for (const contact of contacts) {
    contactRef.innerHTML += await contactsTemplate(contact, "name");
    if (assigned.some((user) => user.name === contact["name"])) validateAssign(contact["name"]);
  }
}

async function assignedUsers(name, color) {
  if (assigned.some((user) => user.name === name)) {
    removeAssignedUsers(name);
    return;
  }
  addAssignedUsers(name, color);
}

async function addAssignedUsers(name, color) {
  assigned.push({ name: name, color: color });
  if (assigned.length > 3) {
    assigned.pop();
    validateAssign(name);
  } 
  updateAssigned();
}

async function removeAssignedUsers(name) {
  if (assigned.length === 3) {
    removeFromThreeAssigned(name);
    return;
  }
  removeFromAssigned(name);
}

function removeFromThreeAssigned(name) {
  const index = assigned.findIndex((user) => user.name === name);
  if (index === 2) assigned.pop();
  if (index === 1) assigned.splice(1, 1);
  if (index === 0) assigned.shift();
  updateAssigned();
}

function removeFromAssigned(name) {
  const index = assigned.findIndex((user) => user.name === name);
  if (index === 1) assigned.pop();
  if (index === 0) assigned.shift();
  updateAssigned();
}

async function updateAssigned() {
  const assignedRef = document.getElementById("assignedUser");
  assignedRef.innerHTML = "";
  for (let index = 0; index < assigned.length; index++) {
    assignedRef.innerHTML += await contactInitials(assigned[index]);
  }
}

function validateAssign(name) {
  document.getElementById(name).classList.toggle('assigned_button');
}

function resetAssigned() {
  const assignedRef = document.getElementById("assignedUser");
  assignedRef.innerHTML = "";
  assigned = [];
}
