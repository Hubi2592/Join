/**
 * Initializes the contacts page.
 */
function initContacts() {
  const uid = localStorage.getItem("uid");

  if (!uid) {
    window.location.href = "../index.html";
    return;
  }

  setupLogoutButton();
  initializeContactsPage(uid);
}


/**
 * Initializes all contact page components.
 * @param {string} uid - Current user ID.
 */
function initializeContactsPage(uid) {
  loadOwnProfile(uid);
  injectAddContactDialog();
  loadContacts(uid);
  registerDialogListeners();
  registerContactListeners();
}


/**
 * Sorts contacts alphabetically by name.
 * @param {Array} contacts - Contacts to sort.
 * @returns {Array} Sorted contacts.
 */
function sortContactsByName(contacts) {
  return [...contacts].sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
}


/**
 * Groups contacts by their first letter.
 * @param {Array} contacts - Contacts to group.
 * @returns {Object} Grouped contacts.
 */
function groupContactsByLetter(contacts) {
  const groups = {};

  contacts.forEach((contact) => {
    addContactToGroup(groups, contact);
  });

  return groups;
}


/**
 * Adds a contact to its alphabetical group.
 * @param {Object} groups - Contact groups.
 * @param {Object} contact - Contact to add.
 */
function addContactToGroup(groups, contact) {
  const letter = contact.name.charAt(0).toUpperCase();

  if (!groups[letter]) {
    groups[letter] = [];
  }

  groups[letter].push(contact);
}


/**
 * Creates the header for a contact group.
 * @param {string} letter - Group letter.
 * @returns {string} Header HTML.
 */
function contactGroupHeaderTemplate(letter) {
  return `<li class="contact_group_header">${letter}</li>`;
}


/**
 * Renders the complete contacts list.
 * @param {Array} contacts - Contacts to render.
 */
function renderContactsList(contacts) {
  const list = document.getElementById("contactsList");
  const sorted = sortContactsByName(contacts);
  const grouped = groupContactsByLetter(sorted);

  list.innerHTML = createContactsListHtml(grouped);
}


/**
 * Creates the HTML for all contact groups.
 * @param {Object} grouped - Grouped contacts.
 * @returns {string} Contacts list HTML.
 */
function createContactsListHtml(grouped) {
  return Object.keys(grouped)
    .sort()
    .map((letter) => createContactGroupHtml(letter, grouped[letter]))
    .join("");
}


/**
 * Creates the HTML for one contact group.
 * @param {string} letter - Group letter.
 * @param {Array} contacts - Contacts in the group.
 * @returns {string} Contact group HTML.
 */
function createContactGroupHtml(letter, contacts) {
  const header = contactGroupHeaderTemplate(letter);
  const items = contacts.map(contactsListItemTemplate).join("");

  return header + items;
}


/**
 * Renders the current user in the contacts list.
 * @param {Object|null} user - Current user data.
 */
function renderOwnUser(user) {
  const container = document.getElementById("ownUser");
  if (!container) return;

  container.innerHTML = user
    ? contactsListItemTemplate(user)
    : "";
}


/**
 * Displays the details of a contact.
 * @param {Object} contact - Contact to display.
 */
function showContactDetail(contact) {
  if (!contact) return;

  const card = document.getElementById("contactCard");
  card.innerHTML = contactDetailTemplate(contact);
}


/**
 * Clears the contact detail view.
 */
function clearContactDetail() {
  const card = document.getElementById("contactCard");

  card.innerHTML =
    "<p>Select a contact to see details.</p>";
}


/**
 * Opens the contact detail view on mobile devices.
 */
function openMobileContactDetail() {
  if (window.innerWidth >= 1251) return;

  const list = document.querySelector(".contacts_container");
  const details = document.querySelector(".contact_details_container");

  list.classList.add("mobile_detail_hidden");
  details.classList.add("mobile_detail_open");
}


/**
 * Closes the contact detail view on mobile devices.
 */
function closeMobileContactDetail() {
  const list = document.querySelector(".contacts_container");
  const details = document.querySelector(".contact_details_container");

  list.classList.remove("mobile_detail_hidden");
  details.classList.remove("mobile_detail_open");
}


/**
 * Inserts the add contact dialog into the page.
 */
function injectAddContactDialog() {
  const mainContent = document.querySelector(".main_content");

  mainContent.insertAdjacentHTML(
    "beforeend",
    addContactDialogTemplate()
  );
}


/**
 * Inserts the edit contact dialog into the page.
 * @param {Object} contact - Contact to edit.
 */
function injectEditContactDialog(contact) {
  removeEditContactDialog();

  const mainContent = document.querySelector(".main_content");

  mainContent.insertAdjacentHTML(
    "beforeend",
    editContactDialogTemplate(contact)
  );
}


/**
 * Removes the edit contact dialog.
 */
function removeEditContactDialog() {
  const dialog = document.getElementById("editContact");

  if (dialog) {
    dialog.remove();
  }
}


/**
 * Opens the edit contact dialog.
 */
function openEditContactDialog() {
  const dialog = document.getElementById("editContact");

  openDialog("editContact");
  openAnimation(dialog);
}


/**
 * Closes the edit contact dialog.
 */
function closeEditContactDialog() {
  const dialog = document.getElementById("editContact");

  closeAnimation(dialog);
}


/**
 * Opens the add contact dialog.
 */
function openAddContactDialog() {
  const dialog = document.getElementById("addContact");

  openDialog("addContact");
  openAnimation(dialog);
}


/**
 * Closes the add contact dialog.
 */
function closeAddContactDialog() {
  const dialog = document.getElementById("addContact");

  closeAnimation(dialog);
}


/**
 * Toggles the mobile contact action menu.
 */
function toggleMobileContactMenu() {
  const menu = document.querySelector(".contact_mobile_menu");
  if (!menu) return;

  menu.classList.toggle("contact_mobile_menu_open");
}


/**
 * Closes the mobile contact action menu.
 */
function closeMobileContactMenu() {
  const menu = document.querySelector(".contact_mobile_menu");
  if (!menu) return;

  menu.classList.remove("contact_mobile_menu_open");
}


/**
 * Shows the success overlay temporarily.
 */
function showSuccessOverlay() {
  const overlay = document.getElementById("successOverlay");

  overlay.hidden = false;

  setTimeout(() => {
    overlay.hidden = true;
  }, 2000);
}