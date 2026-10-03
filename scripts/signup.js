const baseUrl =
  "https://joindb-ccbc2-default-rtdb.europe-west1.firebasedatabase.app/";

const apiKey = "AIzaSyBBqXuaXjnWIvN5to5PuH5jif1FhT_9KKw";

/**
 * Gets references to the sign-up form fields.
 * @returns {Object} Sign-up form fields.
 */
function getFormFields() {
  return {
    username: document.getElementById("username"),
    email: document.getElementById("email"),
    password: document.getElementById("password"),
    confirmPassword: document.getElementById("confirmPassword"),
    acceptPrivacy: document.getElementById("acceptPrivacy"),
  };
}

/**
 * Checks whether the sign-up form is valid.
 * @returns {boolean} Whether the form is valid.
 */
function isFormValid() {
  const form = getFormFields();
  const usernameValid = form.username.value.trim() !== "";
  const emailValid = isValidEmail(form.email.value);
  const passwordValid = form.password.value.length >= 8;
  const passwordsMatch = checkPasswordsMatch(form);

  return usernameValid && emailValid && passwordValid &&
    passwordsMatch && form.acceptPrivacy.checked;
}

/**
 * Checks whether both passwords match.
 * @param {Object} form - Sign-up form fields.
 * @returns {boolean} Whether the passwords match.
 */
function checkPasswordsMatch(form) {
  return form.confirmPassword.value !== "" &&
    form.password.value === form.confirmPassword.value;
}

/**
 * Checks whether an email has a valid format.
 * @param {string} email - Email address.
 * @returns {boolean} Whether the email is valid.
 */
function isValidEmail(email) {
  const emailPattern =
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

  return emailPattern.test(email.trim());
}

/**
 * Sets or clears the error state (message and red border) for a field.
 * @param {string} inputId - Input element ID.
 * @param {string} errorId - Error message element ID.
 * @param {boolean} valid - Whether the field is valid.
 * @param {string} message - Error message to show when invalid.
 */
function setFieldErrorState(inputId, errorId, valid, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);

  if (error) error.textContent = valid ? "" : message;
  input.classList.toggle("input_error", !valid);
}

/**
 * Validates the username.
 * @returns {boolean} Whether the username is valid.
 */
function validateUsername() {
  const input = document.getElementById("username");
  const valid = input.value.trim() !== "";

  setFieldErrorState("username", "usernameError", valid, "Please enter your name.");
  return valid;
}

/**
 * Validates the sign-up email.
 * @returns {boolean} Whether the email is valid.
 */
function validateSignUpEmail() {
  const input = document.getElementById("email");
  const valid = isValidEmail(input.value);

  setFieldErrorState("email", "emailError", valid, "Please enter a valid email address.");
  return valid;
}

/**
 * Validates the password.
 * @returns {boolean} Whether the password is valid.
 */
function validatePassword() {
  const input = document.getElementById("password");
  const valid = input.value.length >= 8;

  setFieldErrorState("password", "passwordError", valid, "Password must be at least 8 characters.");
  return valid;
}

/**
 * Validates the repeated password.
 * @returns {boolean} Whether both passwords match.
 */
function validateConfirmPassword() {
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirmPassword").value;
  const valid = confirm !== "" && confirm === password;

  setFieldErrorState("confirmPassword", "confirmPasswordError", valid, "Passwords do not match.");
  return valid;
}

/**
 * Validates the privacy checkbox.
 * @returns {boolean} Whether the privacy policy is accepted.
 */
function validatePrivacy() {
  const checkbox = document.getElementById("acceptPrivacy");
  const error = document.getElementById("privacyError");

  if (!error) return checkbox.checked;

  error.textContent = checkbox.checked
    ? ""
    : "Please accept the Privacy Policy.";

  return checkbox.checked;
}

/**
 * Validates all sign-up fields.
 * @returns {boolean} Whether all fields are valid.
 */
function validateSignUpFields() {
  const usernameValid = validateUsername();
  const emailValid = validateSignUpEmail();
  const passwordValid = validatePassword();
  const confirmValid = validateConfirmPassword();
  const privacyValid = validatePrivacy();

  return usernameValid && emailValid && passwordValid &&
    confirmValid && privacyValid;
}

/**
 * Updates the sign-up button state based on form validity.
 */
function updateSubmitButtonState() {
  const button = document.getElementById("signUpButton");
  button.disabled = !isFormValid();
}

/**
 * Returns a random contact color.
 * @returns {string} CSS contact color variable.
 */
function getRandomContactColor() {
  const randomColor = Math.floor(Math.random() * 15) + 1;
  return "--contact_color_" + randomColor;
}

/**
 * Creates a Firebase Auth account.
 * @param {string} email - User email.
 * @param {string} password - User password.
 * @returns {Promise} Firebase sign-up request.
 */
function signUpUser(email, password) {
  const url = getSignUpUrl();
  const data = { email, password, returnSecureToken: true };

  return fetch(url, {
    method: "POST",
    body: JSON.stringify(data),
  }).then((response) => response.json());
}

/**
 * Returns the Firebase sign-up URL.
 * @returns {string} Firebase sign-up URL.
 */
function getSignUpUrl() {
  return `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;
}

/**
 * Saves a new user to the database.
 * @param {string} uid - User ID.
 * @param {string} username - Username.
 * @param {string} email - User email.
 * @param {string} idToken - Firebase authentication token.
 * @returns {Promise} Firebase database request.
 */
function saveUserToDatabase(uid, username, email, idToken) {
  const url = baseUrl + "users/" + uid + ".json?auth=" + idToken;
  const user = { username, email, color: getRandomContactColor() };

  return fetch(url, {
    method: "PUT",
    body: JSON.stringify(user),
  });
}

/**
 * Handles the sign-up form submission.
 * @param {Event} event - Submit event.
 */
function handleSignUpSubmit(event) {
  event.preventDefault();

  const valid = validateSignUpFields();
  if (!valid) return;

  const form = getFormFields();
  createUserAccount(form);
}

/**
 * Creates the user account and database entry.
 * @param {Object} form - Sign-up form fields.
 */
function createUserAccount(form) {
  signUpUser(form.email.value.trim(), form.password.value)
    .then((data) => saveCreatedUser(data, form))
    .then(() => showSuccessOverlay())
    .catch(handleSignUpError);
}

/**
 * Saves a successfully created user.
 * @param {Object} data - Firebase authentication data.
 * @param {Object} form - Sign-up form fields.
 * @returns {Promise} Firebase database request.
 */
function saveCreatedUser(data, form) {
  if (data.error) throw data.error;

  return saveUserToDatabase(
    data.localId,
    form.username.value.trim(),
    form.email.value.trim(),
    data.idToken,
  );
}

/**
 * Handles sign-up errors.
 * @param {Object} error - Sign-up error.
 */
function handleSignUpError(error) {
  if (error.message === "EMAIL_EXISTS") {
    setFieldErrorState("email", "emailError", false, "This email is already in use.");
    return;
  }

  console.error(error);
}

/**
 * Shows the success overlay and starts the redirect.
 */
function showSuccessOverlay() {
  const overlay = document.getElementById("successOverlay");
  overlay.hidden = false;

  setTimeout(redirectToLogin, 2000);
}

/**
 * Redirects to the login page.
 */
function redirectToLogin() {
  window.location.href = "../index.html";
}

/**
 * Registers the sign-up form listeners.
 */
function registerSignUpListeners() {
  const form = getFormFields();

  form.acceptPrivacy.addEventListener("change", validatePrivacy);
  form.acceptPrivacy.addEventListener("change", updateSubmitButtonState);

  form.username.addEventListener("input", validateUsername);
  form.username.addEventListener("input", updateSubmitButtonState);

  form.email.addEventListener("input", validateSignUpEmail);
  form.email.addEventListener("input", updateSubmitButtonState);

  form.password.addEventListener("input", validatePassword);
  form.password.addEventListener("input", updateSubmitButtonState);

  form.confirmPassword.addEventListener("input", validateConfirmPassword);
  form.confirmPassword.addEventListener("input", updateSubmitButtonState);
}

/**
 * Initializes the sign-up page.
 */
function initSignUp() {
  const signUpForm = document.querySelector(".signUpForm");

  signUpForm.addEventListener("submit", handleSignUpSubmit);
  registerSignUpListeners();
  updateSubmitButtonState();
}

document.addEventListener("DOMContentLoaded", initSignUp);