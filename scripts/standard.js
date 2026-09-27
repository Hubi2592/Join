const baseUrl =
  "https://joindb-ccbc2-default-rtdb.europe-west1.firebasedatabase.app/";

function openDialog(reference) {
  let dialogRef = document.getElementById(reference);
  dialogRef.showModal();
  document.body.classList.toggle("dialog_open");
}

function closeDialog(reference) {
  let dialogRef = document.getElementById(reference);
  dialogRef.close();
  document.body.classList.toggle("dialog_open");
}

function openAnimation(reference) {
  reference.classList.add("slide_in");
  reference.addEventListener(
    "animationend",
    () => reference.classList.remove("slide_in"),
    { once: true },
  );
}

function closeAnimation(reference) {
  return new Promise((resolve) => {
    if (reference.classList.contains("slide_out")) {
      resolve();
      return;
    }
    reference.classList.add("slide_out");
    reference.addEventListener(
      "animationend", () => {
        reference.classList.remove("slide_out");
        reference.close();
        resolve();
      },
      { once: true },
    );
  });
}

// Fills the profile icon with the user's initials (first and last name)
function displayProfileIcon(userData) {
  const profileIcon = document.getElementById('userInitial');
  const nameParts = userData.username.trim().split(' ').filter((part) => part !== '');

  if (nameParts.length === 1) {
    profileIcon.textContent = nameParts[0].charAt(0).toUpperCase();
  } else {
    const firstInitial = nameParts[0].charAt(0).toUpperCase();
    const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
    profileIcon.textContent = firstInitial + lastInitial;
  }
}

// Loads the current user's own data and fills their profile icon
function loadOwnProfile(uid) {
  const idToken = localStorage.getItem('idToken');
  fetch(baseUrl + 'users/' + uid + '.json?auth=' + idToken)
    .then(response => response.json())
    .then((userData) => displayProfileIcon(userData));
}

async function contactInitials(contact) {
  return `
    <div class="contact_color" style="background-color: var(${await contact.color});">${getInitials(contact.name)}</div>
  `;
}

function setupLogoutButton() {
  const button = document.getElementById("logoutButton");
  if (!button) return;

  button.addEventListener("click", handleLogout);
}

function handleLogout(event) {
  event.preventDefault();

  localStorage.removeItem("uid");
  localStorage.removeItem("idToken");
  localStorage.removeItem("isGuest");
  sessionStorage.setItem("logoutSuccess", "true");

  window.location.replace("../index.html");
}