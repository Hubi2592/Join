const state = {
  contacts: [],
  ownUser: null,
};

function createContact(contactData) {
  const token = localStorage.getItem("idToken");
  const path = `contacts.json?auth=${token}`;

  return fetch(baseUrl + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(contactData),
  }).then(checkContactResponse);
}

function deleteContact(uid, contactId) {
  const token = localStorage.getItem("idToken");
  const path = `contacts/${contactId}.json?auth=${token}`;

  return fetch(baseUrl + path, {
    method: "DELETE",
  }).then(checkContactResponse);
}

function updateContact(uid, contactId, contactData) {
  const token = localStorage.getItem("idToken");
  const path = `contacts/${contactId}.json?auth=${token}`;

  return fetch(baseUrl + path, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(contactData),
  }).then(checkContactResponse);
}

function checkContactResponse(response) {
  if (!response.ok) {
    throw new Error(`Firebase error: ${response.status}`);
  }

  return response.json();
}

function updateOwnUser(uid, userData) {
  const token = localStorage.getItem("idToken");
  const path = `users/${uid}.json?auth=${token}`;

  return fetch(baseUrl + path, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
}

function getRandomContactColor() {
  const randomIndex = Math.floor(Math.random() * 15) + 1;
  return "--contact_color_" + randomIndex;
}

function generateContact(name, email, phone) {
  const contactData = {
    name,
    email,
    phone,
    color: getRandomContactColor(),
  };

  return createContact(contactData);
}

async function loadContacts(uid) {
  const contacts = await loadContactsData();
  const ownUser = await loadOwnContact(uid);

  saveAndRenderContacts(contacts, ownUser);
}

async function loadContactsData() {
  const token = localStorage.getItem("idToken");
  const path = `contacts.json?auth=${token}`;
  const response = await fetch(baseUrl + path);

  if (!response.ok) {
    throw new Error(`Firebase error: ${response.status}`);
  }

  return response.json();
}

async function loadOwnContact(uid) {
  if (localStorage.getItem("isGuest") === "true") {
    return null;
  }

  const user = await getOwnUserData(uid);
  return createOwnContact(user, uid);
}

async function getOwnUserData(uid) {
  const token = localStorage.getItem("idToken");
  const path = `users/${uid}.json?auth=${token}`;
  const response = await fetch(baseUrl + path);

  if (!response.ok) {
    throw new Error(`Firebase error: ${response.status}`);
  }

  return response.json();
}

function createOwnContact(user, uid) {
  if (!user) return null;

  return {
    id: uid,
    name: user.username,
    email: user.email || "",
    phone: user.phone || "",
    color: user.color || "--contact_color_1",
    isOwnUser: true,
  };
}

function mapContactsToArray(data) {
  if (!data) return [];

  return Object.keys(data).map((key) => {
    return {
      id: key,
      ...data[key],
    };
  });
}

function saveAndRenderContacts(data, ownUser = null) {
  state.contacts = mapContactsToArray(data);
  state.ownUser = ownUser;

  renderOwnUser(ownUser);
  renderContactsList(state.contacts);
}

function findContactById(contacts, id) {
  return contacts.find((contact) => contact.id === id);
}

function getContactById(contactId) {
  if (state.ownUser?.id === contactId) {
    return state.ownUser;
  }

  return findContactById(state.contacts, contactId);
}

function createOwnUserUpdateData(contact) {
  return {
    username: contact.name,
    email: contact.email,
    phone: contact.phone,
  };
}