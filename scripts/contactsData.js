const state = {
  contacts: [],
  ownUser: null,
};


/**
 * Creates a new contact in Firebase.
 * @param {Object} contactData - Contact data to save.
 * @returns {Promise} Firebase request promise.
 */
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


/**
 * Deletes a contact from Firebase.
 * @param {string} uid - Current user ID.
 * @param {string} contactId - Contact ID to delete.
 * @returns {Promise} Firebase request promise.
 */
function deleteContact(uid, contactId) {
  const token = localStorage.getItem("idToken");
  const path = `contacts/${contactId}.json?auth=${token}`;

  return fetch(baseUrl + path, {
    method: "DELETE",
  }).then(checkContactResponse);
}


/**
 * Updates an existing contact in Firebase.
 * @param {string} uid - Current user ID.
 * @param {string} contactId - Contact ID to update.
 * @param {Object} contactData - Updated contact data.
 * @returns {Promise} Firebase request promise.
 */
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


/**
 * Checks a Firebase response for errors.
 * @param {Response} response - Firebase response.
 * @returns {Promise} Parsed response data.
 * @throws {Error} If the request was unsuccessful.
 */
function checkContactResponse(response) {
  if (!response.ok) {
    throw new Error(`Firebase error: ${response.status}`);
  }

  return response.json();
}


/**
 * Updates the current user's data in Firebase.
 * @param {string} uid - Current user ID.
 * @param {Object} userData - Updated user data.
 * @returns {Promise} Firebase request promise.
 */
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


/**
 * Returns a random contact color variable.
 * @returns {string} CSS contact color variable.
 */
function getRandomContactColor() {
  const randomIndex = Math.floor(Math.random() * 15) + 1;
  return "--contact_color_" + randomIndex;
}


/**
 * Creates and saves a new contact.
 * @param {string} name - Contact name.
 * @param {string} email - Contact email.
 * @param {string} phone - Contact phone number.
 * @returns {Promise} Firebase request promise.
 */
function generateContact(name, email, phone) {
  const contactData = {
    name,
    email,
    phone,
    color: getRandomContactColor(),
  };

  return createContact(contactData);
}


/**
 * Loads and renders all contacts.
 * @param {string} uid - Current user ID.
 * @returns {Promise<void>}
 */
async function loadContacts(uid) {
  const contacts = await loadContactsData();
  const ownUser = await loadOwnContact(uid);

  saveAndRenderContacts(contacts, ownUser);
}


/**
 * Loads all contacts from Firebase.
 * @returns {Promise<Object|null>} Contact data.
 */
async function loadContactsData() {
  const token = localStorage.getItem("idToken");
  const path = `contacts.json?auth=${token}`;
  const response = await fetch(baseUrl + path);

  if (!response.ok) {
    throw new Error(`Firebase error: ${response.status}`);
  }

  return response.json();
}


/**
 * Loads the current user as a contact.
 * @param {string} uid - Current user ID.
 * @returns {Promise<Object|null>} Own contact or null for guests.
 */
async function loadOwnContact(uid) {
  if (localStorage.getItem("isGuest") === "true") {
    return null;
  }

  const user = await getOwnUserData(uid);
  return createOwnContact(user, uid);
}


/**
 * Loads the current user's data from Firebase.
 * @param {string} uid - Current user ID.
 * @returns {Promise<Object|null>} User data.
 */
async function getOwnUserData(uid) {
  const token = localStorage.getItem("idToken");
  const path = `users/${uid}.json?auth=${token}`;
  const response = await fetch(baseUrl + path);

  if (!response.ok) {
    throw new Error(`Firebase error: ${response.status}`);
  }

  return response.json();
}


/**
 * Converts user data into an own contact object.
 * @param {Object|null} user - Current user data.
 * @param {string} uid - Current user ID.
 * @returns {Object|null} Own contact data.
 */
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


/**
 * Converts Firebase contact data into an array.
 * @param {Object|null} data - Firebase contact data.
 * @returns {Array} Contact array.
 */
function mapContactsToArray(data) {
  if (!data) return [];

  return Object.keys(data).map((key) => {
    return {
      id: key,
      ...data[key],
    };
  });
}


/**
 * Stores and renders the loaded contacts.
 * @param {Object|null} data - Firebase contact data.
 * @param {Object|null} ownUser - Current user's contact.
 */
function saveAndRenderContacts(data, ownUser = null) {
  state.contacts = mapContactsToArray(data);
  state.ownUser = ownUser;

  renderOwnUser(ownUser);
  renderContactsList(state.contacts);
}


/**
 * Finds a contact by its ID.
 * @param {Array} contacts - Contacts to search.
 * @param {string} id - Contact ID.
 * @returns {Object|undefined} Matching contact.
 */
function findContactById(contacts, id) {
  return contacts.find((contact) => contact.id === id);
}


/**
 * Returns a contact by its ID.
 * @param {string} contactId - Contact ID.
 * @returns {Object|undefined|null} Matching contact.
 */
function getContactById(contactId) {
  if (state.ownUser?.id === contactId) {
    return state.ownUser;
  }

  return findContactById(state.contacts, contactId);
}


/**
 * Creates update data for the current user.
 * @param {Object} contact - Updated contact data.
 * @returns {Object} User data for Firebase.
 */
function createOwnUserUpdateData(contact) {
  return {
    username: contact.name,
    email: contact.email,
    phone: contact.phone,
  };
}