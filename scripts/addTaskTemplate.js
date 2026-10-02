/**
 * Creates the HTML for a subtask.
 * @param {string} subtask - Subtask text.
 * @param {number} index - Subtask index.
 * @returns {string} Subtask HTML.
 */
function createSubtaskTemplate(subtask, index) {
  return `
    <li class="subtasks_list_item" id="subtaskListItem${+index}">
      <p id="subtaskName${+index}">${escapeHtml(subtask)}</p>
      <div>
        <button class="subtask_icon" type="button" data-action="edit" data-index="${index}" aria-label="Edit subtask">
          <img src="../assets/img/summary/penValidate.svg" alt="Edit subtask"/>
        </button>
        <div class="subtask_middle"></div>
        <button class="subtask_icon" type="button" data-action="delete" data-index="${index}" aria-label="Delete subtask">
          <img src="../assets/img/general/delete.svg" alt="Delete subtask"/>
        </button>
      </div>
    </li>
  `;
}

/**
 * Creates the HTML for editing a subtask.
 * @param {string} subtext - Current subtask text.
 * @param {number} index - Subtask index.
 * @returns {string} Subtask edit HTML.
 */
function subtaskEditTemplate(subtext, index){
  return `
    <section class="edit_wrapper">
      <input class="edit" id="newSubtask" type="text" value="${subtext}">
      <div>
        <button class="subtask_icon" data-action="delete">
          <img src="../assets/img/general/delete.svg" alt="Delete Subtask">
        </button>
        <div class="subtask_middle"></div>
        <button class="subtask_icon" onclick="editSubtask('newSubtask', ${index})">
          <img src="../assets/img/summary/checkValidate.svg" alt="Edited Subtask">
        </button>
      </div>
    </section>
  `;
}

/**
 * Recreates the HTML for a subtask.
 * @param {string} subtask - Subtask text.
 * @param {number} index - Subtask index.
 * @returns {string} Subtask HTML.
 */
function recreateSubtaskTemplate(subtask, index) {
  return `
    <p id="subtaskName${+index}">${escapeHtml(subtask)}</p>
    <div>
      <button class="subtask_icon" type="button" data-action="edit" data-index="${index}" aria-label="Edit subtask">
        <img src="../assets/img/summary/penValidate.svg" alt="Edit subtask"/>
      </button>
      <div class="subtask_middle"></div>
      <button class="subtask_icon" type="button" data-action="delete" data-index="${index}" aria-label="Delete subtask">
        <img src="../assets/img/general/delete.svg" alt="Delete subtask"/>
      </button>
    </div>
  `
}

/**
 * Creates the HTML for a contact selection option.
 * @param {Object} contact - Contact data.
 * @param {string} name - Property containing the contact name.
 * @returns {Promise<string>} Contact selection HTML.
 */
async function contactsTemplate(contact, name) {
  return `
    <button class="select_contacts_option assign" id="${contact[name]}" type="button" data-value="Contact" onclick="assignedUsers('${contact[name]}', '${contact.color}'); this.classList.toggle('assigned_button'); this.querySelector('.subtask_checkbox').checked = this.classList.contains('assigned_button')">
      <div class="assign">
        <div class="contact_color" style="background-color: var(${contact.color});">${await getInitials(contact[name])}</div>
        ${contact[name]}
      </div>
      <input type="checkbox" class="subtask_checkbox" />
      <span class="subtask_checkbox_custom_assigned"></span>
    </button>
`;
}