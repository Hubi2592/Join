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

function handleOwnUserClick(event) {
  const item = event.target.closest(".contact_item");

  if (!item || !state.ownUser) return;

  showContactDetail(state.ownUser);
  highlightContact(state.ownUser.id);
  openMobileContactDetail();
}

function handleDeleteContact(contactId) {
  const contact = findContactById(state.contacts, contactId);
  if (!contact) return;

  const uid = localStorage.getItem("uid");

  deleteContact(uid, contactId).then(() => {
    finishDeleteContact(uid);
  });
}

function finishDeleteContact(uid) {
  clearContactDetail();
  closeMobileContactDetail();
  loadContacts(uid);
}

function handleContactCardClick(event) {
  const actionButton = event.target.closest("[data-action]");

  if (actionButton) {
    handleMobileContactAction(actionButton);
    return;
  }

  handleDesktopContactAction(event);
}

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

function openMobileEdit(button) {
  closeMobileContactMenu();
  handleEditContact(button.dataset.contactId);
}

function deleteMobileContact(button) {
  closeMobileContactMenu();
  handleDeleteContact(button.dataset.contactId);
}

function handleAddContactSubmit(event) {
  event.preventDefault();

  if (!validateAddContact()) return;

  const uid = localStorage.getItem("uid");
  const data = getAddContactFormData();

  generateContact(data.name, data.email, data.phone)
    .then(() => finishAddContact(uid));
}

function getAddContactFormData() {
  return {
    name: document.getElementById("contactName").value.trim(),
    email: document.getElementById("contactEmail").value.trim(),
    phone: document.getElementById("contactPhone").value.trim(),
  };
}

function finishAddContact(uid) {
  document.getElementById("addContactForm").reset();

  closeDialog("addContact");
  loadContacts(uid);
  showSuccessOverlay();
}

function handleEditContact(contactId) {
  const contact = getContactById(contactId);
  if (!contact) return;

  injectEditContactDialog(contact);
  registerEditDialogListeners();
  openEditContactDialog();
}

function handleEditContactSubmit(event) {
  event.preventDefault();

  if (!validateEditContact()) return;

  const uid = localStorage.getItem("uid");
  const data = getEditContactFormData();
  const contact = getContactById(data.id);

  if (!contact) return;

  saveEditedContact(uid, contact, data);
}

function saveEditedContact(uid, contact, data) {
  if (contact.isOwnUser) {
    saveOwnUserEdit(uid, data.contact);
    return;
  }

  saveNormalContactEdit(uid, data);
}

function saveNormalContactEdit(uid, data) {
  updateContact(uid, data.id, data.contact).then(() => {
    finishEditContact(uid, data.id);
  });
}

function saveOwnUserEdit(uid, contact) {
  const userData = createOwnUserUpdateData(contact);

  updateOwnUser(uid, userData).then(() => {
    finishOwnUserEdit(uid);
  });
}

function finishOwnUserEdit(uid) {
  removeEditContactDialog();

  loadContacts(uid).then(() => {
    showContactDetail(state.ownUser);
    highlightContact(state.ownUser.id);
    loadOwnProfile(uid);
  });
}

function finishEditContact(uid, contactId) {
  removeEditContactDialog();

  loadContacts(uid).then(() => {
    showContactDetail(getContactById(contactId));
    highlightContact(contactId);
  });
}

function getEditContactFormData() {
  return {
    id: document.getElementById("editContactId").value,
    contact: getEditContactValues(),
  };
}

function getEditContactValues() {
  return {
    name: document.getElementById("editContactName").value.trim(),
    email: document.getElementById("editContactEmail").value.trim(),
    phone: document.getElementById("editContactPhone").value.trim(),
  };
}

function validateAddContact() {
  const name = validateContactName("contactName");
  const email = validateContactEmail("contactEmail");
  const phone = validateContactPhone("contactPhone");

  return name && email && phone;
}

function validateEditContact() {
  const name = validateContactName("editContactName");
  const email = validateContactEmail("editContactEmail");
  const phone = validateContactPhone("editContactPhone");

  return name && email && phone;
}

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

function validateContactEmail(id) {
  const input = document.getElementById(id);
  const value = input.value.trim();
  const valid = isValidContactEmail(value);

  setContactError(
    id,
    valid ? "" : "Please enter a valid email."
  );

  return valid;
}

function isValidContactEmail(email) {
  const pattern =
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,6}$/;

  return pattern.test(email);
}

function validateContactPhone(id) {
  const input = document.getElementById(id);
  const value = input.value.trim();
  const valid = /^[0-9+\-() ]+$/.test(value);

  setContactError(
    id,
    valid ? "" : "Please enter a valid phone number."
  );

  return valid;
}

function setContactError(id, message) {
  const input = document.getElementById(id);
  const error = document.getElementById(id + "Error");

  if (!input || !error) return;

  error.textContent = message;
  input.classList.toggle("input_error", Boolean(message));
}
function restrictNameInput(event) {
  event.target.value = event.target.value.replace(
    /[^A-Za-zÄÖÜäöüßÀ-ÿ' -]/g,
    ""
  );
}

function restrictPhoneInput(event) {
  event.target.value = event.target.value.replace(
    /[^0-9+\-() ]/g,
    ""
  );
}

function handleEditDelete(event) {
  const contactId = event.currentTarget.dataset.contactId;

  handleDeleteContact(contactId);
  closeAnimation(document.getElementById("editContact"));
}

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

function registerDialogListeners() {
  registerAddContactForm();
  registerAddContactButtons();
  registerCloseContactButtons();
}

function registerAddContactForm() {
  const form = document.getElementById("addContactForm");

  form.addEventListener(
    "submit",
    handleAddContactSubmit
  );
}

function registerAddContactButtons() {
  const desktop = document.getElementById("addContactButton");
  const mobile = document.getElementById("mobileAddContactButton");

  desktop.addEventListener("click", openAddContactDialog);
  mobile.addEventListener("click", openAddContactDialog);
}

function registerCloseContactButtons() {
  const close = document.getElementById("closeAddContactButton");
  const cancel = document.getElementById("cancelAddContactButton");

  close.addEventListener("click", closeAddContactDialog);
  cancel.addEventListener("click", closeAddContactDialog);
}

function registerContactListeners() {
  const list = document.getElementById("contactsList");
  const ownUser = document.getElementById("ownUser");
  const card = document.getElementById("contactCard");

  list.addEventListener("click", handleContactClick);
  ownUser.addEventListener("click", handleOwnUserClick);
  card.addEventListener("click", handleContactCardClick);
}

function highlightContact(contactId) {
  clearContactHighlights();

  const item = document.querySelector(
    `[data-contact-id="${contactId}"]`
  );

  if (item) item.classList.add("contact_item_active");
}

function clearContactHighlights() {
  document.querySelectorAll(".contact_item_active").forEach((item) => {
    item.classList.remove("contact_item_active");
  });
}