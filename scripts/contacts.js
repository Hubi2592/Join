function initContacts() {
  const uid = localStorage.getItem("uid");

  if (!uid) {
    window.location.href = "../index.html";
    return;
  }

  setupLogoutButton();
  initializeContactsPage(uid);
}


function initializeContactsPage(uid) {
  loadOwnProfile(uid);
  injectAddContactDialog();
  loadContacts(uid);
  registerDialogListeners();
  registerContactListeners();
}


function sortContactsByName(contacts) {
  return [...contacts].sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
}


function groupContactsByLetter(contacts) {
  const groups = {};

  contacts.forEach((contact) => {
    addContactToGroup(groups, contact);
  });

  return groups;
}


function addContactToGroup(groups, contact) {
  const letter = contact.name.charAt(0).toUpperCase();

  if (!groups[letter]) {
    groups[letter] = [];
  }

  groups[letter].push(contact);
}


function contactGroupHeaderTemplate(letter) {
  return `<li class="contact_group_header">${letter}</li>`;
}


function renderContactsList(contacts) {
  const list = document.getElementById("contactsList");
  const sorted = sortContactsByName(contacts);
  const grouped = groupContactsByLetter(sorted);

  list.innerHTML = createContactsListHtml(grouped);
}


function createContactsListHtml(grouped) {
  return Object.keys(grouped)
    .sort()
    .map((letter) => createContactGroupHtml(letter, grouped[letter]))
    .join("");
}


function createContactGroupHtml(letter, contacts) {
  const header = contactGroupHeaderTemplate(letter);
  const items = contacts.map(contactsListItemTemplate).join("");

  return header + items;
}


function renderOwnUser(user) {
  const container = document.getElementById("ownUser");
  if (!container) return;

  container.innerHTML = user
    ? contactsListItemTemplate(user)
    : "";
}


function showContactDetail(contact) {
  if (!contact) return;

  const card = document.getElementById("contactCard");
  card.innerHTML = contactDetailTemplate(contact);
}


function clearContactDetail() {
  const card = document.getElementById("contactCard");

  card.innerHTML =
    "<p>Select a contact to see details.</p>";
}


function openMobileContactDetail() {
  if (window.innerWidth >= 1251) return;

  const list = document.querySelector(".contacts_container");
  const details = document.querySelector(".contact_details_container");

  list.classList.add("mobile_detail_hidden");
  details.classList.add("mobile_detail_open");
}


function closeMobileContactDetail() {
  const list = document.querySelector(".contacts_container");
  const details = document.querySelector(".contact_details_container");

  list.classList.remove("mobile_detail_hidden");
  details.classList.remove("mobile_detail_open");
}


function injectAddContactDialog() {
  const mainContent = document.querySelector(".main_content");

  mainContent.insertAdjacentHTML(
    "beforeend",
    addContactDialogTemplate()
  );
}


function injectEditContactDialog(contact) {
  removeEditContactDialog();

  const mainContent = document.querySelector(".main_content");

  mainContent.insertAdjacentHTML(
    "beforeend",
    editContactDialogTemplate(contact)
  );
}


function removeEditContactDialog() {
  const dialog = document.getElementById("editContact");

  if (dialog) {
    dialog.remove();
  }
}


function openEditContactDialog() {
  const dialog = document.getElementById("editContact");

  openDialog("editContact");
  openAnimation(dialog);
}


function closeEditContactDialog() {
  const dialog = document.getElementById("editContact");

  closeAnimation(dialog);
}


function openAddContactDialog() {
  const dialog = document.getElementById("addContact");

  openDialog("addContact");
  openAnimation(dialog);
}


function closeAddContactDialog() {
  const dialog = document.getElementById("addContact");

  closeAnimation(dialog);
}


function toggleMobileContactMenu() {
  const menu = document.querySelector(".contact_mobile_menu");
  if (!menu) return;

  menu.classList.toggle("contact_mobile_menu_open");
}


function closeMobileContactMenu() {
  const menu = document.querySelector(".contact_mobile_menu");
  if (!menu) return;

  menu.classList.remove("contact_mobile_menu_open");
}


function showSuccessOverlay() {
  const overlay = document.getElementById("successOverlay");

  overlay.hidden = false;

  setTimeout(() => {
    overlay.hidden = true;
  }, 2000);
}