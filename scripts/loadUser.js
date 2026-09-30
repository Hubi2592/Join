/**
 * Initializes the add task page.
 */
function initAddTaskPage() {
  initProfileMenu();
  initAddTask();
}


/**
 * Initializes the information page.
 */
function initInformationPage() {
  const uid = localStorage.getItem("uid");

  if (!uid) {
    window.location.href = "../index.html";
    return;
  }

  loadOwnProfile(uid);
  initProfileMenu();
  setupBackButton();
  setupLogoutButton();
}


/**
 * Initializes the profile menu.
 */
function initProfileMenu() {
  const button = document.getElementById("profileButton");
  const navigation = document.getElementById("nav");

  if (!button || !navigation) return;

  button.addEventListener("click", openProfileMenu);
  navigation.addEventListener("click", closeProfileMenu);
  initSubnavigation();
}


/**
 * Opens the profile menu.
 */
function openProfileMenu() {
  const navigation = document.getElementById("nav");
  if (!navigation) return;

  navigation.showModal();
}


/**
 * Closes the profile menu.
 */
function closeProfileMenu() {
  const navigation = document.getElementById("nav");
  if (!navigation) return;

  navigation.close();
}


/**
 * Initializes the profile subnavigation.
 */
function initSubnavigation() {
  const subnavigation = document.getElementById("subnavigation");
  if (!subnavigation) return;

  subnavigation.addEventListener("click", stopProfilePropagation);
}


/**
 * Prevents clicks from closing the profile menu.
 * @param {Event} event - Click event.
 */
function stopProfilePropagation(event) {
  event.stopPropagation();
}


/**
 * Initializes the back button.
 */
function setupBackButton() {
  const button = document.getElementById("backButton");
  if (!button) return;

  button.addEventListener("click", goBack);
}


/**
 * Navigates to the previous page.
 */
function goBack() {
  history.back();
}


/**
 * Loads the current user's profile.
 * @param {string} uid - Current user ID.
 */
function loadOwnProfile(uid) {
  if (isGuestUser()) {
    showProfileInitials("G");
    return;
  }

  loadUserProfile(uid);
}


/**
 * Checks whether the current user is a guest.
 * @returns {boolean} Whether the user is a guest.
 */
function isGuestUser() {
  return localStorage.getItem("isGuest") === "true";
}


/**
 * Loads user profile data from Firebase.
 * @param {string} uid - Current user ID.
 */
function loadUserProfile(uid) {
  const idToken = localStorage.getItem('idToken');
  fetch(`${baseUrl}users/${uid}.json?auth=${idToken}`)
    .then((response) => response.json())
    .then(showUserInitials)
    .catch(handleProfileError);
}


/**
 * Displays the user's initials.
 * @param {Object} user - User profile data.
 */
function showUserInitials(user) {
  if (!user) return;

  const name = user.name || user.username || "";
  showProfileInitials(getInitials(name));
}


/**
 * Sets the initials in the profile icon.
 * @param {string} initials - Initials to display.
 */
function showProfileInitials(initials) {
  const element =
    document.getElementById("userInitial") ||
    document.querySelector(".profile_icon p");

  if (!element) return;

  element.textContent = initials;
}


/**
 * Handles errors while loading the user profile.
 * @param {Error} error - Profile loading error.
 */
function handleProfileError(error) {
  console.error("Profile could not be loaded:", error);
}