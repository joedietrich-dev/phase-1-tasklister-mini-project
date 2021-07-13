// TO DO: Ordering by due date and priority (and back to date created)
// TO DO: (upload / download?)
// TO DO: Drag and drop manual ordering? Nah.
// TO DO: Styling

let toDoItems = retrieveItems();
const ORDINAL_PRIORITY = [
  'highest',
  'high',
  'medium',
  'low',
  'lowest'
]

document.addEventListener("DOMContentLoaded", () => {
  newTaskForm = document.querySelector('#create-task-form');
  newTaskForm.addEventListener('submit', handleAddToDo);
  reRenderAllItems(toDoItems);
});

// Render
function renderToDo(dataset) {
  const { title, dueDate, description, priority, id } = dataset;
  const renderedDescription = cleanHtmlInput(renderFromMarkdown(description));
  const renderedDueDate = renderDate(dueDate);
  const item = elAdder('li', null, { classes: ['to-do', 'expanded'], dataset: dataset });
  const toDoTitleArea = elAdder('div', item, { classes: ['to-do-title'] });
  const toDoMove = elAdder('img', toDoTitleArea, { src: './img/dots-vertical.svg', height: 20, width: 20, alt: `move ${title}`, dataset: { toDoId: id }, classes: ['move-icon'] })
  const toDoPriority = elAdder('div', toDoTitleArea, { text: capitalize(priority), classes: ['to-do-title__priority', `priority_${priority}`] });
  const toDoTitle = elAdder('div', toDoTitleArea, { text: title, classes: ['to-do-title__title'] });
  const toDoDate = elAdder('div', toDoTitleArea, { text: renderedDueDate, classes: ['to-do-title__date'] });
  const toDoDelete = elAdder('img', toDoTitleArea, { src: './img/trash.svg', height: 20, width: 20, alt: `delete ${title}`, dataset: { toDoId: id }, classes: ['delete-icon'] })
  const toDoEdit = elAdder('img', toDoTitleArea, { src: './img/edit.svg', height: 20, width: 20, alt: `edit ${title}`, dataset: { toDoId: id }, classes: ['edit-icon'] })
  const toDoDescriptionArea = elAdder('div', item, { innerHTML: renderedDescription, classes: ['to-do-description'] });

  toDoDelete.addEventListener('click', handleDeleteToDo);
  toDoEdit.addEventListener('click', handleEditToDo);

  return item;
}

function renderEditToDo(dataset) {
  const { title, dueDate, description, priority, id } = dataset;
  const item = elAdder('li', null, { classes: ['to-do', 'expanded', 'to-do-edit'], dataset: dataset });
  const toDoTitleArea = elAdder('div', item, { classes: ['to-do-title'] });
  const toDoMove = elAdder('img', toDoTitleArea, { src: './img/dots-vertical.svg', height: 20, width: 20, alt: `move ${title}`, dataset: { toDoId: id }, classes: ['icon', 'move-icon'] })
  const toDoPriority = elAdder('select', toDoTitleArea, { id: `priority-${id}`, classes: ['to-do-title__priority', `priority_edit`], selectOptions: ORDINAL_PRIORITY, selectedDefault: priority });
  const toDoTitle = elAdder('input', toDoTitleArea, { id: `title-${id}`, type: 'text', value: title, classes: ['to-do-title__title', 'title_edit'], required: true });
  const toDoDate = elAdder('input', toDoTitleArea, { id: `date-${id}`, type: 'date', value: dueDate, classes: ['to-do-title__date', 'date_edit'] });
  const toDoSave = elAdder('img', toDoTitleArea, { src: './img/save.svg', height: 20, width: 20, alt: `save ${title}`, dataset: { toDoId: id }, classes: ['icon', 'save-icon'] })
  const toDoCancelEdit = elAdder('img', toDoTitleArea, { src: './img/close.svg', height: 20, width: 20, alt: `cancel editing ${title}`, dataset: { toDoId: id }, classes: ['icon', 'cancel-icon'] })
  const toDoDescriptionArea = elAdder('textarea', item, { id: `description-${id}`, value: description, classes: ['to-do-description', 'description_edit'] });

  toDoCancelEdit.addEventListener('click', handleCancelEdit);
  toDoSave.addEventListener('click', handleSaveToDo);

  return item;
}

function reRenderAllItems(toDos) {
  const toDoList = document.querySelector('#tasks');
  toDoList.innerHTML = null;
  toDos.forEach(item => {
    const toDo = renderToDo(item);
    toDoList.appendChild(toDo);
  });
}

// Store / Retrieve
function storeItems(toDos) {
  localStorage.setItem('toDoItems', JSON.stringify(toDos));
}

function retrieveItems() {
  return JSON.parse(localStorage.getItem('toDoItems')) || [];
}

// Create
function handleAddToDo(e) {
  e.preventDefault();
  const newTaskTitle = document.querySelector('[name=new-task-title]').value;
  const newTaskDescription = document.querySelector('[name=new-task-description]').value;
  const newTaskPriority = document.querySelector('[name=new-task-priority]').value;
  const newTaskDueDate = document.querySelector('[name=new-task-date]').value;

  constructToDo(newTaskTitle, newTaskDescription, newTaskPriority, newTaskDueDate)
}

function constructToDo(title, description, priority, dueDate) {
  const toDoList = document.querySelector('#tasks');

  const id = Date.now()
  const initialOrder = toDoItems.length;
  const itemDataset = {
    id: id,
    order: initialOrder,
    dueDate: dueDate,
    priority: priority,
    description: description,
    title: title
  };

  const item = renderToDo(itemDataset);

  toDoItems.push(itemDataset);
  storeItems(toDoItems);
  toDoList.appendChild(item);
}

// Update
function handleEditToDo(e) {
  const editedItemID = parseInt(e.target.dataset.toDoId);
  const editingDataset = toDoItems.find(item => item.id === editedItemID);
  const editToDo = renderEditToDo(editingDataset);
  const viewToDo = getToDoFromId(editedItemID);
  viewToDo.parentNode.replaceChild(editToDo, viewToDo);
}

function handleSaveToDo(e) {
  const savedItemID = parseInt(e.target.dataset.toDoId);
  const priority = document.querySelector(`#priority-${savedItemID}`).value || '';
  const dueDate = document.querySelector(`#date-${savedItemID}`).value || '';
  const description = document.querySelector(`#description-${savedItemID}`).value || '';
  const title = document.querySelector(`#title-${savedItemID}`).value || '';

  const oldItemIndex = toDoItems.findIndex(item => item.id === savedItemID);

  if (oldItemIndex < 0) throw new Error(`Couldn't find item to save.`);

  const oldItemDataset = toDoItems[oldItemIndex];
  const savedItemDataset = {
    ...oldItemDataset,
    dueDate: dueDate,
    priority: priority,
    description: description,
    title: title
  };

  toDoItems = [...toDoItems.slice(0, oldItemIndex), savedItemDataset, ...toDoItems.slice(oldItemIndex + 1)];
  storeItems(toDoItems);
  const saveToDo = renderToDo(savedItemDataset);
  const editToDo = getToDoFromId(savedItemID);
  editToDo.parentNode.replaceChild(saveToDo, editToDo);
}

function handleCancelEdit(e) {
  const cancelledItemId = parseInt(e.target.dataset.toDoId);
  const cancelledDataset = toDoItems.find(item => item.id === cancelledItemId);
  const cancelledToDo = renderToDo(cancelledDataset);
  const editToDo = getToDoFromId(cancelledItemId);
  editToDo.parentNode.replaceChild(cancelledToDo, editToDo);
}

// Delete
function handleDeleteToDo(e) {
  const deletedItemID = parseInt(e.target.dataset.toDoId);
  const deletedItem = getToDoFromId(deletedItemID);

  toDoItems = toDoItems.filter(item => item.id !== deletedItemID);
  storeItems(toDoItems);
  deletedItem.remove();
}

// Helpers
function elAdder(type, parent, options = {}) {
  const element = document.createElement(type);
  if (options['classes']) element.classList.add(...options.classes);
  if (options['id']) element.id = options.id;
  if (options['text']) element.textContent = options.text;
  if (options['src']) element.src = options.src;
  if (options['alt']) element.alt = options.alt;
  if (options['height']) element.height = options.height;
  if (options['width']) element.width = options.width;
  if (options['href']) element.href = options.href;
  if (options['type']) element.type = options.type;
  if (options['name']) element.name = options.name;
  if (options['for']) element.htmlFor = options.for;
  if (options['innerHTML']) element.innerHTML = options.innerHTML;
  if (options['fontFamily']) element.style.fontFamily = options.fontFamily;
  if (options['fontWeight']) element.style.fontWeight = options.fontWeight;
  if (options['dataset']) {
    for (key in options.dataset) {
      element.dataset[key] = options.dataset[key];
    }
  }
  if (type === 'select') {
    if (options['selectOptions']) {
      options.selectOptions.forEach(option => {
        const selectOption = document.createElement('option');
        selectOption.value = option;
        selectOption.text = capitalize(option);
        element.appendChild(selectOption);
      });
    }
    if (options['selectedDefault'] && options['selectOptions']) {
      if (options.selectOptions.includes(options.selectedDefault)) {
        element.selectedIndex = options.selectOptions.indexOf(options.selectedDefault);
      }
    }
  }
  if (options['required']) element.required = true;
  if (options['value']) element.value = options.value;
  if (options['newpage']) {
    element.target = '_blank';
    element.rel = 'noopener noreferrer';
  }

  if (parent) parent.appendChild(element);
  return element;
}

function renderFromMarkdown(markdown) {
  return marked(markdown);
}

function cleanHtmlInput(htmlInput) {
  return DOMPurify.sanitize(htmlInput, { USE_PROFILES: { html: true } })
}

function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
}

function renderDate(dateText) {
  const date = new Date(dateText);
  return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
}

function getToDoFromId(id) {
  return document.querySelector(`[data-id='${id}']`);
}