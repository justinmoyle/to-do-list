import "./styles.css";
import trashImg from "./pics/trash.png";

const listContainer = document.querySelector('[data-lists]');
const newListBtn = document.querySelector('.new-list-btn');
const newTaskBtn = document.querySelector('.new-task-btn');
const popupContainer = document.querySelector('.popup-container');
const cancelPopUp = document.querySelectorAll('.popup-cancel-btn');
const listFormTemplate = document.getElementById('list-form-template');
const taskFormTemplate = document.getElementById('task-form-template');
const popupContentArea = document.querySelector('[data-popup-content-area]');
const listDisplayContainer = document.querySelector('[data-list-display-container]');
const listTitleElement = document.querySelector('[data-list-title]');
const listActiveCount = document.querySelector('[data-list-active-count]');
const listCompletedCount = document.querySelector('[data-list-completed-task]');
const listTotalTaskCount = document.querySelector('[data-total-task-count]');
const taskContainer = document.querySelector('[data-tasks]');
const taskTemplate = document.getElementById('task-template');



const LOCAL_STORAGE_LIST_KEY = 'task.lists'
const LOCAL_STORAGE_SELECTED_ID_KEY = 'task.selectedListId'
let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_ID_KEY);
let taskToEditId = null;

listContainer.addEventListener('click', e => {
    const clickedDeleteButton = e.target.closest('[data-delete-list]');

    if (clickedDeleteButton != null) {
        const listToDeleteDiv = clickedDeleteButton.closest('[data-list-id]');

        if (listToDeleteDiv) {
            const idToDelete = listToDeleteDiv.dataset.listId;

            lists = lists.filter(list => list.id !== idToDelete)
            if (selectedListId === idToDelete) {
                selectedListId = null;
            }
            saveAndRender();
            return;
        }
    } 

    const clickedListItem = e.target.closest('[data-list-id]')
    if (clickedListItem != null) {
        selectedListId = clickedListItem.dataset.listId;
        saveAndRender();
    }
});

taskContainer.addEventListener('change', e => {
    if (e.target.matches('input[type="checkbox"]')){
        const taskId = e.target.id;
        const selectedList = lists.find(list => list.id === selectedListId);
        const task = selectedList.tasks.find(t => t.id === taskId);
        task.complete = e.target.checked;
        saveAndRender();
    }
});

taskContainer.addEventListener('click', handleTaskActions);

function handleTaskActions(e) {
    const deleteButton = e.target.closest('.delete-task');
    const editButton = e.target.closest('.edit-task');

    if (deleteButton) {
        const taskItem = deleteButton.closest('.task-item');
        if (!taskItem) return;

        const taskId = taskItem.dataset.taskId;

        if (taskId) {
            deleteTask(taskId);
            saveAndRender();
        }
    }

    if (editButton){
        const taskItem = editButton.closest('.task-item');
        if (!taskItem) return;
        const taskId = taskItem.dataset.taskId;

        if (taskId) {
            openEditTaskPopUp(taskId);
        }
    }
}

function deleteTask(taskId) {
    const selectedList = lists.find(list => list.id === selectedListId);

    if (selectedList) {
        selectedList.tasks = (selectedList.tasks ?? []).filter(task => task.id !== taskId);
    }
}

function openEditTaskPopUp(taskId) {
    const selectedList = lists.find(list => list.id === selectedListId);
    const task = selectedList.tasks.find(t => t.id === taskId);
    if (!task) return;

    taskToEditId = taskId;
    loadPopUpForm(taskFormTemplate);
    const newForm = popupContentArea.querySelector('form');

    newForm.querySelector('#popup-task-input').value = task.name;
    newForm.querySelector('#popup-task-description').value = task.description;
    newForm.querySelector('#popup-date-due').value = task.date;
    newForm.querySelector('#popup-priority-select').value = task.priority;

    const submitBtn = newForm.querySelector('.popup-add-task-btn');
    if (submitBtn) {
        submitBtn.textContent = 'Save Changes';
    }

}

function save() {
    localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists));
    localStorage.setItem(LOCAL_STORAGE_SELECTED_ID_KEY, selectedListId);
}

function saveAndRender(){
    save();
    render();
}

function render() {
    clearElement(listContainer)
    renderLists();

    const selectedList = lists.find(list => list.id === selectedListId)

    if (selectedList == null) {
        listDisplayContainer.style.display = 'none';
    } else {
        listDisplayContainer.style.display = '';
        listTitleElement.innerText = selectedList.name
        renderActiveTaskCount(selectedList);
        renderCompletedTaskCount(selectedList);
        renderTotalTaskCount(selectedList);
        clearElement(taskContainer);
        renderTasks(selectedList);
    }
}




function renderTotalTaskCount(selectedList) {
    const totalTasks = selectedList.tasks.length;
    listTotalTaskCount.innerText = `${totalTasks}`;
}

function renderCompletedTaskCount(selectedList) {
    const completedTasks = selectedList.tasks.filter(task => task.complete).length;
    listCompletedCount.innerText = `${completedTasks}`;
}

function renderActiveTaskCount(selectedList) {
    const incompleteTasks = selectedList.tasks.filter(task =>
        !task.complete).length
        listActiveCount.innerText = `${incompleteTasks}`
}



function renderTasks(selectedList){
    selectedList.tasks.forEach(task => {
        const taskElement = document.importNode(taskTemplate.content, true);
        taskElement.querySelector('.task-item').dataset.taskId = task.id;

        const checkbox = taskElement.querySelector('input');
        checkbox.id = task.id
        checkbox.checked = task.complete

        const taskTitle = taskElement.querySelector('.task-title');
        taskTitle.htmlFor = task.id
        taskTitle.append(task.name);
        
        const taskDescription = taskElement.querySelector('.task-description');
        taskDescription.htmlFor = task.id
        taskDescription.append(task.description);
        
        const taskDueDate = taskElement.querySelector('.due-date');
        taskDueDate.htmlFor = task.id
        taskDueDate.append(task.date);

        const taskPriorityElement = taskElement.querySelector('.task-priority');
        taskPriorityElement.textContent = task.priority;
        taskPriorityElement.classList.add(task.priority.toLowerCase());

        taskPriorityElement.htmlFor = task.id;

        taskContainer.appendChild(taskElement);
    })
}

function renderLists() {
    lists.forEach(list => {
        const listDiv = document.createElement('div');
        listDiv.classList.add('list-item');
        listDiv.dataset.listId = list.id;
        
        const listName = document.createElement('li');
        listName.classList.add('list-name');
        listName.innerText = list.name;

        const activeTaskAmount = document.createElement('p');
        activeTaskAmount.classList.add('active-task-amount');

        const incompleteTasks = list.tasks.filter(task => !task.complete).length;
        activeTaskAmount.textContent = incompleteTasks;

        const deleteListBtn = document.createElement('button');
        const trashPic = document.createElement('img');
        trashPic.classList.add('delete-list-pic');
        trashPic.src = trashImg;
        deleteListBtn.appendChild(trashPic);
        deleteListBtn.classList.add('delete-list');
        deleteListBtn.dataset.deleteList = true;
        if (list.id === selectedListId) {
        listDiv.classList.add('active-list');
        };

        listDiv.append(listName, activeTaskAmount, deleteListBtn);
        listContainer.appendChild(listDiv);
    });
};


function loadPopUpForm(template) {
    clearElement(popupContentArea);
        const formElement = document.importNode(template.content, true);

    popupContentArea.appendChild(formElement);

    const newForm = popupContentArea.querySelector('form');
    const inputField = newForm.querySelector('input[type="text"]');

    if (inputField) {
        inputField.focus();
    }
    if (newForm.hasAttribute('data-new-list-form')) {
        newForm.addEventListener('submit', handleListSubmission);
    } else if (newForm.hasAttribute('data-new-task-form')) {
        newForm.addEventListener('submit', handleTaskSubmission);
    }

    popupContentArea.querySelectorAll('.popup-cancel-btn').forEach(button => {
        button.addEventListener('click', closePopUp);
    });

    openPopUp();

    return inputField;
}


const HIDDEN_CLASS = 'hidden';

function openPopUp() {
    popupContainer.classList.remove(HIDDEN_CLASS);
};

function openNewTaskPopUp(){
    loadPopUpForm(taskFormTemplate);
}

function openNewListPopUp(){
    loadPopUpForm(listFormTemplate);
}

function closePopUp() {
    popupContainer.classList.add(HIDDEN_CLASS);

    taskToEditId = null;

    clearElement(popupContentArea);
};

function handleListSubmission(e) {
    e.preventDefault();
    const newForm = e.currentTarget;
    const listNameInput = newForm.querySelector('[data-new-list-input]');
    const listName = listNameInput ? listNameInput.value : '';

    if (listName == null || listName === '') return;

    const list = createList(listName);
    lists.push(list);

    selectedListId = list.id;

    closePopUp();
    saveAndRender();
}

function handleTaskSubmission(e) {
    e.preventDefault();
    const newForm = e.currentTarget;
    const taskName = newForm.querySelector('#popup-task-input').value;
    const taskDescription = newForm.querySelector('#popup-task-description').value;
    const taskDate = newForm. querySelector('#popup-date-due').value;
    const taskPriority = newForm.querySelector('#popup-priority-select').value;

    if (!taskName) return;

    const selectedList = lists.find(list => list.id === selectedListId);

    if (selectedList == null) {
        alert('Please Select a list before adding a task');
        closePopUp();
        return;
    };

    if (taskToEditId) {
        const task = (selectedList.tasks || []).find(t => t.id === taskToEditId);

        if (task) {
            task.name = taskName;
            task.description = taskDescription;
            task.date = taskDate;
            task.priority = taskPriority;
        }

        taskToEditId = null;
    } else {
        const task = createTask(taskName, taskDescription, taskDate, taskPriority);
        selectedList.tasks.push(task);

    }

    closePopUp();
    saveAndRender();
}

function createList(name) {
    return {id: Date.now().toString(), name: name, tasks: []}
}

function createTask(name, description, date, priority) {
    return {
        id: Date.now().toString(),
        name: name,
        description: description,
        date: date,
        priority: priority,
        complete: false
    }
}

newListBtn.addEventListener('click', openNewListPopUp);

cancelPopUp.forEach(button => {
    button.addEventListener('click', closePopUp);
})
newTaskBtn.addEventListener('click', openNewTaskPopUp);

function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

saveAndRender();