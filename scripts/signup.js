const baseUrl =
  "https://joindb-ccbc2-default-rtdb.europe-west1.firebasedatabase.app/";

const apiKey = "AIzaSyBBqXuaXjnWIvN5to5PuH5jif1FhT_9KKw";

// Collects references to the sign-up form fields
function getFormFields() {
  return {
    username: document.getElementById("username"),
    email: document.getElementById("email"),
    password: document.getElementById("password"),
    confirmPassword: document.getElementById("confirmPassword"),
    acceptPrivacy: document.getElementById("acceptPrivacy"),
  };
}

// Checks whether the sign-up form is valid
function isFormValid() {
  const form = getFormFields();
  const usernameValid = form.username.value.trim() !== "";
  const emailValid = isValidEmail(form.email.value);
  const passwordValid = form.password.value.length >= 8;
  const passwordsMatch = checkPasswordsMatch(form);

  return usernameValid && emailValid && passwordValid &&
    passwordsMatch && form.acceptPrivacy.checked;
}

// Checks whether both passwords match
function checkPasswordsMatch(form) {
  return form.confirmPassword.value !== "" &&
    form.password.value === form.confirmPassword.value;
}

// Checks whether the email has a valid format
function isValidEmail(email) {
  const emailPattern =
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

  return emailPattern.test(email.trim());
}

// Validates the username
function validateUsername() {
  const input = document.getElementById("username");
  const error = document.getElementById("usernameError");
  const valid = input.value.trim() !== "";

  error.textContent = valid ? "" : "Please enter your name.";
  return valid;
}

// Validates the email
function validateSignUpEmail() {
  const input = document.getElementById("email");
  const error = document.getElementById("emailError");
  const valid = isValidEmail(input.value);

  error.textContent = valid ? "" : "Please enter a valid email address.";
  return valid;
}

// Validates the password
function validatePassword() {
  const input = document.getElementById("password");
  const error = document.getElementById("passwordError");
  const valid = input.value.length >= 8;

  error.textContent = valid ? "" : "Password must be at least 8 characters.";
  return valid;
}

// Validates the repeated password
function validateConfirmPassword() {
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirmPassword").value;
  const error = document.getElementById("confirmPasswordError");
  const valid = confirm !== "" && confirm === password;

  error.textContent = valid ? "" : "Passwords do not match.";
  return valid;
}

// Validates the privacy checkbox
function validatePrivacy() {
  const checkbox = document.getElementById("acceptPrivacy");
  const error = document.getElementById("privacyError");

  if (!error) return checkbox.checked;

  error.textContent = checkbox.checked
    ? ""
    : "Please accept the Privacy Policy.";

  return checkbox.checked;
}

// Validates all fields before submitting
function validateSignUpFields() {
  const usernameValid = validateUsername();
  const emailValid = validateSignUpEmail();
  const passwordValid = validatePassword();
  const confirmValid = validateConfirmPassword();
  const privacyValid = validatePrivacy();

  return usernameValid && emailValid && passwordValid &&
    confirmValid && privacyValid;
}

// Enables or disables the sign-up button
function updateSubmitButtonState() {
  const button = document.getElementById("signUpButton");
  button.disabled = false;
}

// Picks a random contact color
function getRandomContactColor() {
  const randomColor = Math.floor(Math.random() * 15) + 1;
  return "--contact_color_" + randomColor;
}

// Creates a Firebase Auth account
function signUpUser(email, password) {
  const url = getSignUpUrl();
  const data = { email, password, returnSecureToken: true };

  return fetch(url, {
    method: "POST",
    body: JSON.stringify(data),
  }).then((response) => response.json());
}

// Returns the Firebase sign-up URL
function getSignUpUrl() {
  return `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;
}

// Writes the new user to the database
function saveUserToDatabase(uid, username, email, idToken) {
  const url = baseUrl + "users/" + uid + ".json?auth=" + idToken;
  const user = { username, email, color: getRandomContactColor() };

  return fetch(url, {
    method: "PUT",
    body: JSON.stringify(user),
  });
}

// Handles the sign-up form submission
function handleSignUpSubmit(event) {
  event.preventDefault();

  const valid = validateSignUpFields();
  if (!valid) return;

  const form = getFormFields();
  createUserAccount(form);
}

// Creates the user account and database entry
function createUserAccount(form) {
  signUpUser(form.email.value.trim(), form.password.value)
    .then((data) => saveCreatedUser(data, form))
    .then(() => showSuccessOverlay())
    .catch(handleSignUpError);
}

// Saves a successfully created user
function saveCreatedUser(data, form) {
  if (data.error) throw data.error;

  return saveUserToDatabase(
    data.localId,
    form.username.value.trim(),
    form.email.value.trim(),
    data.idToken,
  );
}

// Displays sign-up errors
function handleSignUpError(error) {
  const emailError = document.getElementById("emailError");

  if (error.message === "EMAIL_EXISTS") {
    emailError.textContent = "This email is already in use.";
    return;
  }

  console.error(error);
}

// Shows the success overlay and redirects
function showSuccessOverlay() {
  const overlay = document.getElementById("successOverlay");
  overlay.hidden = false;

  setTimeout(redirectToLogin, 2000);
}

// Redirects to the login page
function redirectToLogin() {
  window.location.href = "../index.html";
}

// Registers live form events
function registerSignUpListeners() {
  const form = getFormFields();

  form.acceptPrivacy.addEventListener("change", validatePrivacy);
  form.username.addEventListener("input", updateSubmitButtonState);
  form.email.addEventListener("input", updateSubmitButtonState);
  form.password.addEventListener("input", updateSubmitButtonState);
  form.confirmPassword.addEventListener("input", updateSubmitButtonState);
}

// Initializes the sign-up page
function initSignUp() {
  const signUpForm = document.querySelector(".signUpForm");

  signUpForm.addEventListener("submit", handleSignUpSubmit);
  registerSignUpListeners();
  updateSubmitButtonState();
}