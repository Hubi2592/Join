/**
 * This template shows the content of a ticket in a dialog
 */
async function taskDialogTemplate(arr, index, listKey) {
  return `
    <article class="task_board" id="taskBoard" onclick="stopPropagation(event)">
      <section class="task_board_header">
        <div class="category">
          <p>${await readDatabase(arr, index, "category")}</p>
          <button class="close" onclick="closeSpecificDialog('dialog')">
            <img src="../assets/img/general/close.svg" alt="Close Symbol" />
          </button>
        </div>
      </section>
      <h6>${await readDatabase(arr, index, "title")}</h6>
      <p>${await readDatabase(arr, index, "description")}</p>
      <section class="expiration">
        <p class="subtitle">Due Date:</p>
        <p>${await readDatabase(arr, index, "date")}</p>
      </section>
      <section class="relevance">
        <p class="subtitle">Priority:</p>
        <div>
          <p>${await readDatabase(arr, index, "priority")}</p>
          ${readPriority(await readDatabase(arr, index, "priority"))}
        </div>
      </section>
      <section class="task_board_contacts">
        <p class="subtitle">Assigned To:</p>
        <ul class="task_board_names">
          ${await readAssigned(arr, index)}
        </ul>
      </section>
      <section class="task_board_footer">
        <p class="subtitle">Subtasks</p>
        <ul class="checklist_subtask">
          ${readSubtask(arr, index, "subtasks")}
        </ul>
      </section>
      <section class="delete_edit">
        <button class="task_board_buttons" onclick="deleteTicket('/tickets/${await readDatabase(arr, index, "id")}'), closeSpecificDialog('dialog')">
          <div>
            <img src="../assets/img/general/delete.svg" alt="Delete Symbol" />
            <p>Delete</p>
          </div>
        </button>
        <div class="subtask_middle"></div>
        <button class="task_board_buttons" onclick="editTaskDialog('${listKey}', ${index})">
          <div>
            <img src="../assets/img/summary/penValidate.svg" alt="Pen Symbol"/>
            <p>Edit</p>
          </div>
        </button>
      </section>
    </article>
  `;
}

/**
 * This template shows the assigned user in the ticket's dialog
 */
async function taskDialogNamesTemplate(contact) {
  return `
    <li>
      <div class="contact_color" style="background-color: var(${await contact.color});">${getInitials(contact.name)}</div>
      <p class="contact_name">${await contact.name}</p>
    </li>
  `;
}

/**
 * This template shows the added subtask in the ticket's dialog
 */
function taskDialogSubtasksTemplate(content, index, checked) {
  return `
    <li class="subtask">
      <label class="subtask_checkbox_label" aria-label="Mark task as done">
        <input type="checkbox" class="subtask_checkbox" data-subtask-index="${index}" ${checked ? "checked" : ""} />
        <span class="subtask_checkbox_custom"></span>
      </label>
      <p>${content}</p>
    </li>
  `;
}

/**
 * This template shows if there are no tickets in the column
 */
function nothingTemplate() {
  return `
    <li class="nothing">
      <div>
        <p>No tasks to do</p>
      </div>
    </li>
  `;
}

/**
 * This template shows if no tickets are done
 */
function nothingDoneTemplate() {
  return `
    <li class="nothing">
      <div>
        <p>No tasks Done</p>
      </div>
    </li>
  `;
}

/**
 * This template is the content of the ticket, shown as a card
 */
async function somethingTemplate(arr, index, listKey) {
  return `
    <li class="relative" id="li${+(await readDatabase(arr, index, "id"))}">
      <article
         class="something"
         draggable="true"
         ondrag="shakeAnimation(${await readDatabase(arr, index, "id")})"
         ondragstart="dragTicket(${await readDatabase(arr, index, "id")}, event)"
         ondragend="handleDragEnd(event)"
        > 
        <button class="board_card" id="card${+(await readDatabase(arr, index, "id"))}" onclick="openSpecificDialog('${listKey}', ${index}, ${null}, 'taskBoardDialog')">
          <div class="board_card_content">
            <section class="board_card_header">
              <dialog class="card_navigation" id="cardNav" onclick="stopPropagation(event); closeDialog('cardNav')">
                <div class="subnavigation swap_dialog" onclick="stopPropagation(event)">
                  <p>Move to</p>
                  <div role="button" onclick="closeDialog('cardNav'); changeStatus('toDo')">To Do</div>
                  <div role="button" onclick="closeDialog('cardNav'); changeStatus('inProgress')">In Progress</div>
                  <div role="button" onclick="closeDialog('cardNav'); changeStatus('awaitFeedback')">Await Feedback</div>
                  <div role="button" onclick="closeDialog('cardNav'); changeStatus('done')">Done</div>
                </div>
              </dialog>
              <h4>${await readDatabase(arr, index, "category")}</h4>
              <div class="swap_mobile mobile" role="button" onclick="stopPropagation(event); openSwapDialog('li${+(await readDatabase(arr, index, "id"))}'); dragTicket(${await readDatabase(arr, index, "id")}, event)">
                <img src="../assets/img/mobile/swap.svg" alt="Swap Icon">
              </div>
            </section>
            <section class="card_text">
              <h5>${await readDatabase(arr, index, "title")}</h5>
              <p>${await reduceDescription(arr, index)}</p>
            </section>
            <section class="sub_ladebalken">
              <div class="ladebalken_background"></div>
              <div class="ladebalken"></div>
              <p></p>
            </section>
            <section class="card_footer">
              <div id="assignedInitials">${await addInitials(arr, index)}</div>
              ${readPriority(await readDatabase(arr, index, "priority"))}
            </section>
          </div>
        </button>
      </article>
    </li>
  `;
}