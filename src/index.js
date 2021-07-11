let toDoItems = [];
const ORDINAL_PRIORITY = {
  highest: 0,
  high: 1,
  medium: 2,
  low: 3,
  lowest: 4
}

document.addEventListener("DOMContentLoaded", () => {
  newTaskForm = document.querySelector('#create-task-form');
  newTaskForm.addEventListener('submit', addToDo);
});

function addToDo(e = new Event()) {
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
  const renderedDescription = cleanHtmlInput(renderFromMarkdown(description));
  const itemDataset = {
    id: id,
    order: initialOrder,
    dueDate: dueDate,
    priority: priority,
    description: renderedDescription,
    title: title
  };

  // item.dataset['title'] = title;
  // item.dataset['description'] = renderedDescription;
  // item.dataset['priority'] = priority;
  // item.dataset['dueDate'] = dueDate;
  // item.dataset['order'] = initialOrder;
  // item.dataset['id'] = id;
  const item = renderToDo(itemDataset);

  toDoItems.push(itemDataset);
  toDoList.appendChild(item);
}

function renderToDo(dataset) {
  const { title, dueDate, description, priority, id } = dataset;
  const item = elAdder('li', null, { classes: ['to-do', 'expanded'], dataset: dataset });
  const toDoTitleArea = elAdder('div', item, { classes: ['to-do-title'] });
  const toDoPriority = elAdder('div', toDoTitleArea, { text: priority, classes: ['to-do-title__priority', `priority_${priority}`] });
  const toDoTitle = elAdder('div', toDoTitleArea, { text: title, classes: ['to-do-title__title'] });
  const toDoDate = elAdder('div', toDoTitleArea, { text: dueDate, classes: ['to-do-title__date'] });
  const toDoDelete = elAdder('img', toDoTitleArea, { src: './img/trash.svg', height: 20, width: 20 })
  const toDoDescriptionArea = elAdder('div', item, { innerHTML: description, classes: ['to-do-description'] });

  toDoDelete.addEventListener('click', handleDelete);

  return item;
}

function renderFromMarkdown(markdown) {
  return marked(markdown);
}

function cleanHtmlInput(htmlInput) {
  return DOMPurify.sanitize(htmlInput, { USE_PROFILES: { html: true } })
}

function handleDelete(e) {
  const deletedItemID = parseInt(e.target.parentNode.parentNode.dataset.id);
  toDoItems = toDoItems.filter(item => item.id !== deletedItemID);
  reRenderAllItems();
}

function reRenderAllItems() {
  const toDoList = document.querySelector('#tasks');
  toDoList.innerHTML = null;
  toDoItems.forEach(item => {
    const toDo = renderToDo(item);
    toDoList.appendChild(toDo);
  });
}

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
  if (options['innerHTML']) element.innerHTML = options.innerHTML;
  if (options['fontFamily']) element.style.fontFamily = options.fontFamily;
  if (options['fontWeight']) element.style.fontWeight = options.fontWeight;
  if (options['dataset']) {
    for (key in options.dataset) {
      element.dataset[key] = options.dataset[key];
    }
  }
  if (options['newpage']) {
    element.target = '_blank';
    element.rel = 'noopener noreferrer';
  }

  if (parent) parent.appendChild(element);
  return element;
}