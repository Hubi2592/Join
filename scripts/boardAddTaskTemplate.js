/**
 * This template is a replicate of the addTask.html
 */
async function addTaskDialogTemplate(arr, index, stat) {
  return `
    <article class="add_task_page" onclick="stopPropagation(event)">
        <section class="add_task_head">
          <h1>Add Task</h1>
          <button class="close" onclick="closeSpecificDialog('dialog')">
            <img src="../assets/img/general/close.svg" alt="Close Symbol"/>
          </button>
        </section>
        <article class="add_task_main">
          <section class="add_task_left">
            <div class="add_task_input">
              <p>Title<span>*</span></p>
              <input class="input_areas" id="taskTitle" type="text" placeholder="Enter a title" value="${await readDatabase(arr, index, "title")}" required/>
            </div>
            <div class="add_task_input">
              <p>Description</p>
              <textarea class="description" id="description" placeholder="Enter a Description">${await readDatabase(arr, index, "description")}</textarea>
            </div>
            <div class="add_task_input">
              <p>Due Date<span>*</span></p>
              <input class="input_areas" id="dueDate" type="date" value="${await readDatabase(arr, index, "date")}" required/>
            </div>
          </section>
          <div class="add_task_middle"></div>
          <section class="add_task_right">
            <div class="add_task_input">
              <p>Priority</p>
              <section class="priority">
                <button class="priority_button" type="button" data-priority="Urgent">
                  Urgent <img src="../assets/img/task/urgent.svg" alt="Urgent priority"/>
                </button>
                <button class="priority_button" type="button" data-priority="Medium">
                  Medium <img src="../assets/img/task/medium.svg" alt="Medium priority"/>
                </button>
                <button class="priority_button" type="button" data-priority="Low">
                  Low <img src="../assets/img/task/low.svg" alt="Low priority"/>
                </button>
              </section>
            </div>
            <div class="add_task_input">
              <p>Assigned To</p>
              <div class="select_areas" id="assignedDropdown">
                <button class="select_areas_toggle" type="button">
                  <span class="select_areas_value">
                    Select contacts to assign
                  </span>
                  <span class="select_areas_arrow">▾</span>
                </button>
                <div class="select_areas_menu" id="contactList"></div>
                <input type="hidden" id="assigned" name="assigned" value=""/>
                <div class="assigned_user" id="assignedUser"></div>
              </div>
            </div>
            <div class="add_task_input">
              <p>Category<span>*</span></p>
              <div class="select_areas" id="categoryDropdown">
                <button class="select_areas_toggle" type="button">
                  <span class="select_areas_value">
                    Select task category
                  </span>
                  <span class="select_areas_arrow">▾</span>
                </button>
                <div class="select_areas_menu">
                  <button class="select_areas_option" type="button" data-value="Technical Task">
                    Technical Task
                  </button>
                  <button class="select_areas_option" type="button" data-value="User Story">
                    User Story
                  </button>
                </div>
                <input type="hidden" id="category" name="category" value=""/>
              </div>
            </div>
            <div class="add_task_input">
              <p>Subtasks</p>
              <section class="subtask_wrapper">
                <input class="input_areas" id="subtaskInput" type="text" placeholder="Add new subtask"/>
                <div class="subtask_validating">
                  <button id="clearSubtaskButton" type="button">
                    <img src="../assets/img/general/close.svg" alt="Clear"/>
                  </button>
                  <div class="subtask_middle"></div>
                  <button class="subtask_check" id="addSubtaskButton" type="button">
                    <img src="../assets/img/summary/checkValidate.svg" alt="Add subtask"/>
                  </button>
                </div>
              </section>
            </div>
            <div class="subtasks_displayer">
              <ul class="subtasks_list" id="subtasks"></ul>
            </div>
          </section>
        </article>
        <section class="add_task_footer">
          <p><span>*</span>This field is required</p>
          <div class="footer_buttons">
            <button class="cancel" id="clearTaskButton" type="button">
              Clear
              <img src="../assets/img/general/close.svg" alt="Clear"/>
            </button>
            <button class="highlighted_button" id="createTaskButton" type="button">
              Create Task
              <img src="../assets/img/general/check.svg" alt="Create task"/>
            </button>
            <button class="highlighted_button" id="editTaskButton" onclick="editedTask(${index}, '${stat}')" type="button">
              Ok <img src="../assets/img/general/check.svg" alt="Editing Task">
            </button>
          </div>
        </section>
      </article>
  `
}
