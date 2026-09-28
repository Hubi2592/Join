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

function subtaskEditTemplate(subtext, index){
  return `
    <section class="edit_wrapper">
      <input class="edit" id="newSubtask" type="text" value="${subtext}">
      <div>
        <button class="subtask_icon" onclick="editSubtask('newSubtask', ${index})">
          <img src="../assets/img/summary/checkValidate.svg" alt="Edited Subtask">
        </button>
        <div class="subtask_middle"></div>
        <button class="subtask_icon" data-action="delete">
          <img src="../assets/img/general/delete.svg" alt="Delete Subtask">
        </button>
      </div>
    </section>
  `;
}

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

async function contactsTemplate(contact, name) {
  return `
    <button class="select_contacts_option assign" type="button" data-value="Contact" onclick="assignedUsers('${contact[name]}', '${contact.color}'); this.classList.toggle('assigned_button'); this.querySelector('.subtask_checkbox').checked = this.classList.contains('assigned_button')">
      <div class="assign">
        <div class="contact_color" style="background-color: var(${contact.color});">${await getInitials(contact[name])}</div>
        ${contact[name]}
      </div>
      <input type="checkbox" class="subtask_checkbox" />
      <span class="subtask_checkbox_custom_assigned"></span>
    </button>
`;
}
