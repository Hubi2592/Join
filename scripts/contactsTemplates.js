/**
 * Creates a contact list item.
 * @param {Object} contact - Contact data.
 * @returns {string} Contact list item HTML.
 */
function contactsListItemTemplate(contact) {
  return `
    <li
      class="contact_item"
      data-contact-id="${contact.id}"
    >
      ${contactListAvatarTemplate(contact)}
      ${contactListInfoTemplate(contact)}
    </li>
  `;
}


/**
 * Creates the avatar for a contact list item.
 * @param {Object} contact - Contact data.
 * @returns {string} Avatar HTML.
 */
function contactListAvatarTemplate(contact) {
  return `
    <div
      class="contact_color"
      style="background-color: var(${contact.color});"
    >
      ${getInitials(contact.name)}
    </div>
  `;
}


/**
 * Creates the information for a contact list item.
 * @param {Object} contact - Contact data.
 * @returns {string} Contact information HTML.
 */
function contactListInfoTemplate(contact) {
  return `
    <div class="contact_info">
      <p class="contact_name">
        ${contact.name}
      </p>

      <p class="contact_email">
        ${contact.email}
      </p>

      <p class="contact_phone">
        ${contact.phone || ""}
      </p>
    </div>
  `;
}


/**
 * Creates the complete contact detail view.
 * @param {Object} contact - Contact data.
 * @returns {string} Contact detail HTML.
 */
function contactDetailTemplate(contact) {
  return `
    ${contactDetailHeaderTemplate(contact)}
    ${contactInformationTemplate(contact)}
    ${mobileContactActionsTemplate(contact)}
  `;
}


/**
 * Creates the header of the contact detail view.
 * @param {Object} contact - Contact data.
 * @returns {string} Contact detail header HTML.
 */
function contactDetailHeaderTemplate(contact) {
  return `
    <div class="contact_card_header">
      ${contactDetailAvatarTemplate(contact)}

      <div class="name_and_buttons">
        <h2>${contact.name}</h2>

        <div class="contact_card_buttons">
          ${contactEditButtonTemplate(contact)}
          ${contactDeleteButtonTemplate(contact)}
        </div>
      </div>
    </div>
  `;
}


/**
 * Creates the avatar for the contact detail view.
 * @param {Object} contact - Contact data.
 * @returns {string} Avatar HTML.
 */
function contactDetailAvatarTemplate(contact) {
  return `
    <div
      class="contact_card_color"
      style="background-color: var(${contact.color});"
    >
      ${getInitials(contact.name)}
    </div>
  `;
}


/**
 * Creates the contact information section.
 * @param {Object} contact - Contact data.
 * @returns {string} Contact information HTML.
 */
function contactInformationTemplate(contact) {
  return `
    <section class="contact_card_info">
      <p class="subtitle">
        Contact Information
      </p>

      <p class="detail_label">
        Email
      </p>

      <p class="detail_value contact_email">
        ${contact.email}
      </p>

      <p class="detail_label">
        Phone
      </p>

      <p class="detail_value">
        ${contact.phone || ""}
      </p>
    </section>
  `;
}


/**
 * Creates the desktop edit button.
 * @param {Object} contact - Contact data.
 * @returns {string} Edit button HTML.
 */
function contactEditButtonTemplate(contact) {
  return `
    <button
      class="contact_buttons"
      type="button"
      id="editContactButton"
      data-contact-id="${contact.id}"
    >
      <img
        src="../assets/img/general/edit.svg"
        alt=""
        class="button_icon"
      />
      Edit
    </button>
  `;
}


/**
 * Creates the desktop delete button.
 * @param {Object} contact - Contact data.
 * @returns {string} Delete button HTML or an empty string.
 */
function contactDeleteButtonTemplate(contact) {
  if (contact.isOwnUser) return "";

  return `
    <button
      class="contact_buttons"
      type="button"
      id="deleteContactButton"
      data-contact-id="${contact.id}"
    >
      <img
        src="../assets/img/general/delete.svg"
        alt=""
        class="button_icon"
      />
      Delete
    </button>
  `;
}


/**
 * Creates the mobile contact action menu.
 * @param {Object} contact - Contact data.
 * @returns {string} Mobile action menu HTML.
 */
function mobileContactActionsTemplate(contact) {
  return `
    <div class="mobile contact_mobile_actions">
      <button
        class="contact_more_button"
        type="button"
        data-action="toggle-menu"
        aria-label="Contact options"
      >
        ⋮
      </button>

      <div class="contact_mobile_menu">
        ${mobileEditButtonTemplate(contact)}
        ${mobileDeleteButtonTemplate(contact)}
      </div>
    </div>
  `;
}


/**
 * Creates the mobile edit button.
 * @param {Object} contact - Contact data.
 * @returns {string} Edit button HTML.
 */
function mobileEditButtonTemplate(contact) {
  return `
    <button
      type="button"
      data-action="edit-mobile"
      data-contact-id="${contact.id}"
    >
      <img
        src="../assets/img/general/edit.svg"
        alt=""
      />
      Edit
    </button>
  `;
}


/**
 * Creates the mobile delete button.
 * @param {Object} contact - Contact data.
 * @returns {string} Delete button HTML or an empty string.
 */
function mobileDeleteButtonTemplate(contact) {
  if (contact.isOwnUser) return "";

  return `
    <button
      type="button"
      data-action="delete-mobile"
      data-contact-id="${contact.id}"
    >
      <img
        src="../assets/img/general/delete.svg"
        alt=""
      />
      Delete
    </button>
  `;
}


/**
 * Creates initials from a contact name.
 * @param {string} name - Contact name.
 * @returns {string} Contact initials.
 */
function getInitials(name) {
  const parts = name
    .trim()
    .split(" ")
    .filter((part) => part !== "");

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return getTwoInitials(parts);
}


/**
 * Creates initials from the first and last name parts.
 * @param {Array} parts - Name parts.
 * @returns {string} Two contact initials.
 */
function getTwoInitials(parts) {
  const first = parts[0].charAt(0).toUpperCase();
  const last = parts[parts.length - 1].charAt(0).toUpperCase();

  return first + last;
}