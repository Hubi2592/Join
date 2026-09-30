/**
 * Creates the add contact dialog.
 * @returns {string} Dialog HTML.
 */
function addContactDialogTemplate() {
  return `
    <dialog class="add_contact_dialog" id="addContact">
      ${addContactCloseTemplate()}

      <article class="add_contact">
        ${addContactHeaderTemplate()}
        ${addContactPlaceholderTemplate()}

        <section class="add_contact_content">
          <form id="addContactForm" novalidate>
            ${addContactFieldsTemplate()}
            ${addContactButtonsTemplate()}
          </form>
        </section>
      </article>
    </dialog>
  `;
}


/**
 * Creates the add contact close button.
 * @returns {string} Close button HTML.
 */
function addContactCloseTemplate() {
  return `
    <button
      class="close"
      type="button"
      id="closeAddContactButton"
    >
      <img
        src="../assets/img/general/close.svg"
        alt="Close Symbol"
      />
    </button>
  `;
}


/**
 * Creates the add contact dialog header.
 * @returns {string} Header HTML.
 */
function addContactHeaderTemplate() {
  return `
    <section class="add_contact_header">
      <img
        src="../assets/img/general/joinLogo.svg"
        alt="Join Logo"
      />

      <h2>Add contact</h2>
      <p>Tasks are better with a team!</p>

      <div class="title_underline"></div>
    </section>
  `;
}


/**
 * Creates the contact placeholder.
 * @returns {string} Placeholder HTML.
 */
function addContactPlaceholderTemplate() {
  return `
    <section class="contact_placeholder">
      <img
        src="../assets/img/contacts/person.svg"
        alt="Contact Placeholder"
      />
    </section>
  `;
}


/**
 * Creates the input fields for a new contact.
 * @returns {string} Contact fields HTML.
 */
function addContactFieldsTemplate() {
  return `
    ${contactInputTemplate(
      "contactName",
      "contactName",
      "text",
      "Name",
      "person.svg",
      "restrictNameInput(event)",
      "validateContactName('contactName')"
    )}

    ${contactInputTemplate(
      "contactEmail",
      "contactEmail",
      "email",
      "Email",
      "mail.svg",
      "",
      "validateContactEmail('contactEmail')"
    )}

    ${contactInputTemplate(
      "contactPhone",
      "contactPhone",
      "tel",
      "Phone",
      "phone.svg",
      "restrictPhoneInput(event)",
      "validateContactPhone('contactPhone')"
    )}
  `;
}


/**
 * Creates an input field for the add contact form.
 * @param {string} id - Input element ID.
 * @param {string} name - Input name.
 * @param {string} type - Input type.
 * @param {string} label - Input label.
 * @param {string} icon - Icon filename.
 * @param {string} inputAction - Input event action.
 * @param {string} blurAction - Blur event action.
 * @returns {string} Input field HTML.
 */
function contactInputTemplate(
  id,
  name,
  type,
  label,
  icon,
  inputAction,
  blurAction
) {
  return `
    <div class="form_group">
      <label for="${id}" class="sr_only">
        ${label}
      </label>

      <input
        id="${id}"
        name="${name}"
        type="${type}"
        placeholder="${label}"
        oninput="${inputAction}"
        onblur="${blurAction}"
        required
      />

      <img
        src="../assets/img/contacts/${icon}"
        alt=""
        class="field_icon"
      />

      <p
        class="error_message"
        id="${id}Error"
      ></p>
    </div>
  `;
}


/**
 * Creates the add contact form buttons.
 * @returns {string} Button HTML.
 */
function addContactButtonsTemplate() {
  return `
    <div class="footer_buttons">
      <button
        class="cancel"
        type="button"
        id="cancelAddContactButton"
      >
        Cancel ✕
      </button>

      <button
        class="highlighted_button"
        type="submit"
      >
        Create contact ✓
      </button>
    </div>
  `;
}


/**
 * Creates the edit contact dialog.
 * @param {Object} contact - Contact to edit.
 * @returns {string} Dialog HTML.
 */
function editContactDialogTemplate(contact) {
  return `
    <dialog class="add_contact_dialog" id="editContact">
      ${editContactCloseTemplate()}

      <article class="add_contact">
        ${editContactHeaderTemplate()}
        ${editContactAvatarTemplate(contact)}

        <section class="add_contact_content">
          <form id="editContactForm" novalidate>
            ${editContactFormTemplate(contact)}
          </form>
        </section>
      </article>
    </dialog>
  `;
}


/**
 * Creates the edit contact close button.
 * @returns {string} Close button HTML.
 */
function editContactCloseTemplate() {
  return `
    <button
      class="close"
      type="button"
      id="closeEditContactButton"
    >
      <img
        src="../assets/img/general/close.svg"
        alt="Close Symbol"
      />
    </button>
  `;
}


/**
 * Creates the edit contact dialog header.
 * @returns {string} Header HTML.
 */
function editContactHeaderTemplate() {
  return `
    <section class="add_contact_header">
      <img
        src="../assets/img/general/joinLogo.svg"
        alt="Join Logo"
      />

      <h2>Edit contact</h2>

      <div class="title_underline"></div>
    </section>
  `;
}


/**
 * Creates the avatar for the contact being edited.
 * @param {Object} contact - Contact data.
 * @returns {string} Avatar HTML.
 */
function editContactAvatarTemplate(contact) {
  return `
    <section class="contact_edit_color_spacer">
      <div
        class="contact_card_color contact_edit_color"
        style="background-color: var(${contact.color});"
      >
        ${getInitials(contact.name)}
      </div>
    </section>
  `;
}


/**
 * Creates the edit contact form content.
 * @param {Object} contact - Contact data.
 * @returns {string} Form HTML.
 */
function editContactFormTemplate(contact) {
  return `
    <input
      type="hidden"
      id="editContactId"
      value="${contact.id}"
    />

    ${editContactFieldsTemplate(contact)}
    ${editContactButtonsTemplate(contact)}
  `;
}


/**
 * Creates the input fields for editing a contact.
 * @param {Object} contact - Contact data.
 * @returns {string} Contact fields HTML.
 */
function editContactFieldsTemplate(contact) {
  return `
    ${editContactInputTemplate(
      "editContactName",
      "text",
      "Name",
      contact.name,
      "person.svg",
      "restrictNameInput(event)",
      "validateContactName('editContactName')"
    )}

    ${editContactInputTemplate(
      "editContactEmail",
      "email",
      "Email",
      contact.email,
      "mail.svg",
      "",
      "validateContactEmail('editContactEmail')"
    )}

    ${editContactInputTemplate(
      "editContactPhone",
      "tel",
      "Phone",
      contact.phone,
      "phone.svg",
      "restrictPhoneInput(event)",
      "validateContactPhone('editContactPhone')"
    )}
  `;
}


/**
 * Creates an input field for the edit contact form.
 * @param {string} id - Input element ID.
 * @param {string} type - Input type.
 * @param {string} label - Input label.
 * @param {string} value - Current input value.
 * @param {string} icon - Icon filename.
 * @param {string} inputAction - Input event action.
 * @param {string} blurAction - Blur event action.
 * @returns {string} Input field HTML.
 */
function editContactInputTemplate(
  id,
  type,
  label,
  value,
  icon,
  inputAction,
  blurAction
) {
  return `
    <div class="form_group">
      <label for="${id}" class="sr_only">
        ${label}
      </label>

      <input
        id="${id}"
        name="${id}"
        type="${type}"
        value="${value || ""}"
        oninput="${inputAction}"
        onblur="${blurAction}"
        required
      />

      <img
        src="../assets/img/contacts/${icon}"
        alt=""
        class="field_icon"
      />

      <p
        class="error_message"
        id="${id}Error"
      ></p>
    </div>
  `;
}


/**
 * Creates the edit contact form buttons.
 * @param {Object} contact - Contact data.
 * @returns {string} Button HTML.
 */
function editContactButtonsTemplate(contact) {
  return `
    <div class="footer_buttons">
      ${editDialogDeleteButtonTemplate(contact)}

      <button
        class="highlighted_button"
        type="submit"
      >
        Save ✓
      </button>
    </div>
  `;
}


/**
 * Creates the delete button for the edit dialog.
 * @param {Object} contact - Contact data.
 * @returns {string} Delete button HTML or an empty string.
 */
function editDialogDeleteButtonTemplate(contact) {
  if (contact.isOwnUser) return "";

  return `
    <button
      class="cancel"
      type="button"
      id="deleteEditContactButton"
      data-contact-id="${contact.id}"
    >
      Delete
    </button>
  `;
}