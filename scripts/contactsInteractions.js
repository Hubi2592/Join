/**
 * Handles clicks on regular contacts.
 * @param {Event} event - Click event.
 */
function handleContactClick(event) {
  const item = event.target.closest(".contact_item");
  if (!item) return;

  const contact = findContactById(
    state.contacts,
    item.dataset.contactId
  );

  showContactDetail(contact);
  highlightContact(contact.id);
  openMobileContactDetail();
}

/**
 * Handles clicks on the current user contact.
 * @param {Event} event - Click event.
 */
function handleOwnUserClick(event) {
  const item = event.target.closest(".contact_item");

  if (!item || !state.ownUser) return;

  showContactDetail(state.ownUser);
  highlightContact(state.ownUser.id);
  openMobileContactDetail();
}

/**
 * Deletes a contact.
 * @param {string} contactId - Contact ID.
 */
function handleDeleteContact(contactId) {
  const contact = findContactById(state.contacts, contactId);
  if (!contact) return;

  const uid = localStorage.getItem("uid");

  deleteContact(uid, contactId).then(() => {
    finishDeleteContact(uid);
  });
}

/**
 * Updates the UI after deleting a contact.
 * @param {string} uid - Current user ID.
 */
function finishDeleteContact(uid) {
  clearContactDetail();
  closeMobileContactDetail();
  loadContacts(uid);
}

/**
 * Handles actions inside the contact detail card.
 * @param {Event} event - Click event.
 */
function handleContactCardClick(event) {
  const actionButton = event.target.closest("[data-action]");

  if (actionButton) {
    handleMobileContactAction(actionButton);
    return;
  }

  handleDesktopContactAction(event);
}

/**
 * Handles desktop contact actions.
 * @param {Event} event - Click event.
 */
function handleDesktopContactAction(event) {
  const editButton = event.target.closest("#editContactButton");
  const deleteButton = event.target.closest("#deleteContactButton");

  if (editButton) {
    handleEditContact(editButton.dataset.contactId);
  }

  if (deleteButton) {
    handleDeleteContact(deleteButton.dataset.contactId);
  }
}

/**
 * Handles a mobile contact action.
 * @param {HTMLElement} button - Selected action button.
 */
function handleMobileContactAction(button) {
  const action = button.dataset.action;

  if (action === "toggle-menu") {
    toggleMobileContactMenu();
  }

  if (action === "edit-mobile") {
    openMobileEdit(button);
  }

  if (action === "delete-mobile") {
    deleteMobileContact(button);
  }
}

/**
 * Opens the edit dialog from the mobile menu.
 * @param {HTMLElement} button - Edit button.
 */
function openMobileEdit(button) {
  closeMobileContactMenu();
  handleEditContact(button.dataset.contactId);
}

/**
 * Deletes a contact from the mobile menu.
 * @param {HTMLElement} button - Delete button.
 */
function deleteMobileContact(button) {
  closeMobileContactMenu();
  handleDeleteContact(button.dataset.contactId);
}

/**
 * Handles submission of the add contact form.
 * @param {Event} event - Submit event.
 */
function handleAddContactSubmit(event) {
  event.preventDefault();

  if (!validateAddContact()) return;

  const uid = localStorage.getItem("uid");
  const data = getAddContactFormData();

  generateContact(data.name, data.email, data.phone)
    .then(() => finishAddContact(uid));
}

/**
 * Gets values from the add contact form.
 * @returns {Object} Contact form data.
 */
function getAddContactFormData() {
  return {
    name: document.getElementById("contactName").value.trim(),
    email: document.getElementById("contactEmail").value.trim(),
    phone: document.getElementById("contactPhone").value.trim(),
  };
}

/**
 * Updates the UI after adding a contact.
 * @param {string} uid - Current user ID.
 */
function finishAddContact(uid) {
  document.getElementById("addContactForm").reset();

  closeDialog("addContact");
  loadContacts(uid);
  showSuccessOverlay();
}

/**
 * Opens the edit dialog for a contact.
 * @param {string} contactId - Contact ID.
 */
function handleEditContact(contactId) {
  const contact = getContactById(contactId);
  if (!contact) return;

  injectEditContactDialog(contact);
  registerEditDialogListeners();
  openEditContactDialog();
}

/**
 * Handles submission of the edit contact form.
 * @param {Event} event - Submit event.
 */
function handleEditContactSubmit(event) {
  event.preventDefault();

  if (!validateEditContact()) return;

  const uid = localStorage.getItem("uid");
  const data = getEditContactFormData();
  const contact = getContactById(data.id);

  if (!contact) return;

  saveEditedContact(uid, contact, data);
}

/**
 * Saves an edited contact.
 * @param {string} uid - Current user ID.
 * @param {Object} contact - Existing contact.
 * @param {Object} data - Updated contact data.
 */
function saveEditedContact(uid, contact, data) {
  if (contact.isOwnUser) {
    saveOwnUserEdit(uid, data.contact);
    return;
  }

  saveNormalContactEdit(uid, data);
}

/**
 * Saves changes to a regular contact.
 * @param {string} uid - Current user ID.
 * @param {Object} data - Updated contact data.
 */
function saveNormalContactEdit(uid, data) {
  updateContact(uid, data.id, data.contact).then(() => {
    finishEditContact(uid, data.id);
  });
}

/**
 * Saves changes to the current user.
 * @param {string} uid - Current user ID.
 * @param {Object} contact - Updated contact data.
 */
function saveOwnUserEdit(uid, contact) {
  const userData = createOwnUserUpdateData(contact);

  updateOwnUser(uid, userData).then(() => {
    finishOwnUserEdit(uid);
  });
}

/**
 * Updates the UI after editing the current user.
 * @param {string} uid - Current user ID.
 */
function finishOwnUserEdit(uid) {
  removeEditContactDialog();

  loadContacts(uid).then(() => {
    showContactDetail(state.ownUser);
    highlightContact(state.ownUser.id);
    loadOwnProfile(uid);
  });
}

/**
 * Updates the UI after editing a regular contact.
 * @param {string} uid - Current user ID.
 * @param {string} contactId - Edited contact ID.
 */
function finishEditContact(uid, contactId) {
  removeEditContactDialog();

  loadContacts(uid).then(() => {
    showContactDetail(getContactById(contactId));
    highlightContact(contactId);
  });
}

/**
 * Gets the complete edit form data.
 * @returns {Object} Edit form data.
 */
function getEditContactFormData() {
  return {
    id: document.getElementById("editContactId").value,
    contact: getEditContactValues(),
  };
}

/**
 * Gets the editable contact values.
 * @returns {Object} Contact values.
 */
function getEditContactValues() {
  return {
    name: document.getElementById("editContactName").value.trim(),
    email: document.getElementById("editContactEmail").value.trim(),
    phone: document.getElementById("editContactPhone").value.trim(),
  };
}

/**
 * Validates the add contact form.
 * @returns {boolean} Whether the form is valid.
 */
function validateAddContact() {
  const name = validateContactName("contactName");
  const email = validateContactEmail("contactEmail");
  const phone = validateContactPhone("contactPhone");

  return name && email && phone;
}

/**
 * Validates the edit contact form.
 * @returns {boolean} Whether the form is valid.
 */
function validateEditContact() {
  const name = validateContactName("editContactName");
  const email = validateContactEmail("editContactEmail");
  const phone = validateContactPhone("editContactPhone");

  return name && email && phone;
}

/**
 * Checks whether an email address is valid.
 * @param {string} email - Email address.
 * @returns {boolean} Whether the email is valid.
 */
function isValidContactEmail(email) {
  const pattern =
   /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.(de|com|net|org|info|eu)$/i;

  return pattern.test(email.trim());
}

/**
 * Validates a contact name.
 * @param {string} id - Input element ID.
 * @returns {boolean} Whether the name is valid.
 */
function validateContactName(id) {
  const input = document.getElementById(id);
  const value = input.value.trim();
  const valid = /^[A-Za-zÄÖÜäöüßÀ-ÿ' -]+$/.test(value);

  setContactError(
    id,
    valid ? "" : "Please enter a valid name."
  );

  return valid;
}


/**
 * Validates a contact email address.
 * @param {string} id - Input element ID.
 * @returns {boolean} Whether the email is valid.
 */
function validateContactEmail(id) {
  const input = document.getElementById(id);
  const value = input.value.trim();
  const valid = isValidContactEmail(value);

  setContactError(
    id,
    valid ? "" : "Please enter a valid email address."
  );

  return valid;
}

/**
 * Validates a contact phone number.
 * @param {string} id - Input element ID.
 * @returns {boolean} Whether the phone number is valid.
 */
function validateContactPhone(id) {
  const input = document.getElementById(id);
  const value = input.value.trim();

  const digitCount = (value.match(/\d/g) || []).length;

  const valid =
    /^[0-9+\-() ]+$/.test(value) &&
    !/[+\-() ]{2,}/.test(value) &&
    digitCount >= 7;

  setContactError(
    id,
    valid ? "" : "Please enter a valid phone number."
  );

  return valid;
}

/**
 * Displays or clears an input error.
 * @param {string} id - Input element ID.
 * @param {string} message - Error message.
 */
function setContactError(id, message) {
  const input = document.getElementById(id);
  const error = document.getElementById(id + "Error");

  if (!input || !error) return;

  error.textContent = message;
  input.classList.toggle("input_error", Boolean(message));
}

/**
 * Prevents invalid characters in contact names.
 * @param {Event} event - Input event.
 */
function restrictNameInput(event) {
  const input = event.target;
  const hasNumber = /[0-9]/.test(input.value);

  input.value = input.value.replace(
    /[^A-Za-zÄÖÜäöüßÀ-ÿ' -]/g,
    ""
  );

  setContactError(
    input.id,
    hasNumber ? "You cannot enter numbers in a name." : ""
  );
}

/**
 * Prevents invalid characters in phone numbers.
 * @param {Event} event - Input event.
 */
function restrictPhoneInput(event) {
  const input = event.target;
  const hasLetter = /[A-Za-zÄÖÜäöüßÀ-ÿ]/.test(input.value);

  input.value = input.value.replace(
    /[^0-9+\-() ]/g,
    ""
  );

  setContactError(
    input.id,
    hasLetter ? "You cannot enter letters in a phone number." : ""
  );
}

/**
 * Handles deleting a contact from the edit dialog.
 * @param {Event} event - Click event.
 */
function handleEditDelete(event) {
  const contactId = event.currentTarget.dataset.contactId;

  handleDeleteContact(contactId);
  closeAnimation(document.getElementById("editContact"));
}

/**
 * Registers event listeners for the edit dialog.
 */
function registerEditDialogListeners() {
  const form = document.getElementById("editContactForm");
  const close = document.getElementById("closeEditContactButton");
  const remove = document.getElementById("deleteEditContactButton");

  form.addEventListener("submit", handleEditContactSubmit);
  close.addEventListener("click", closeEditContactDialog);

  if (remove) {
    remove.addEventListener("click", handleEditDelete);
  }
}

/**
 * Registers all contact dialog listeners.
 */
function registerDialogListeners() {
  registerAddContactForm();
  registerAddContactButtons();
  registerCloseContactButtons();
}

/**
 * Registers the add contact form listener.
 */
function registerAddContactForm() {
  const form = document.getElementById("addContactForm");

  form.addEventListener(
    "submit",
    handleAddContactSubmit
  );
}

/**
 * Registers buttons that open the add contact dialog.
 */
function registerAddContactButtons() {
  const desktop = document.getElementById("addContactButton");
  const mobile = document.getElementById("mobileAddContactButton");

  desktop.addEventListener("click", openAddContactDialog);
  mobile.addEventListener("click", openAddContactDialog);
}

/**
 * Registers buttons that close the add contact dialog.
 */
function registerCloseContactButtons() {
  const close = document.getElementById("closeAddContactButton");
  const cancel = document.getElementById("cancelAddContactButton");

  close.addEventListener("click", closeAddContactDialog);
  cancel.addEventListener("click", closeAddContactDialog);
}

/**
 * Registers contact list and detail listeners.
 */
function registerContactListeners() {
  const list = document.getElementById("contactsList");
  const ownUser = document.getElementById("ownUser");
  const card = document.getElementById("contactCard");

  list.addEventListener("click", handleContactClick);
  ownUser.addEventListener("click", handleOwnUserClick);
  card.addEventListener("click", handleContactCardClick);
}

/**
 * Highlights the selected contact.
 * @param {string} contactId - Contact ID.
 */
function highlightContact(contactId) {
  clearContactHighlights();

  const item = document.querySelector(
    `[data-contact-id="${contactId}"]`
  );

  if (item) item.classList.add("contact_item_active");
}

/**
 * Removes all active contact highlights.
 */
function clearContactHighlights() {
  document.querySelectorAll(".contact_item_active").forEach((item) => {
    item.classList.remove("contact_item_active");
  });
}