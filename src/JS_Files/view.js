
// var View = (function () {

function View(rootId) {
  this.rootElement = document.querySelector(rootId);
  this.buttonValues = {
    allTasks: 'allTaskButton',
    completed: 'completedButton',
    pending: 'pendingButton',
    clearCompleted: 'clearCompleted'
  };
  this.viewType = 'allTaskButton'
}

View.prototype.initialize = function () {
  this.renderHeader();
  this.renderTasksViewArea();
  this.renderFooter();
}

View.prototype.renderHeader = function () {
  var header = this.createAnElement('div', { id: 'header' });
  this.rootElement.appendChild(header);
  this.renderAppTitle();
  this.renderInputField();
  this.renderAddButton();
}

View.prototype.renderAppTitle = function () {
  var title = this.createAnElement('h2', {});
  title.innerText = 'My  To-Do  List';
  this.appendElementToHeader(title);
}

View.prototype.renderInputField = function () {
  var inputField = this.createAnElement('input', {
    type: 'text',
    id: 'taskInputField',
    placeholder: 'Add your list items here...'
  });
  this.appendElementToHeader(inputField);
}

View.prototype.renderAddButton = function () {
  var me = this;
  var addButton = me.createAnElement('button', { id: 'addButton' });
  addButton.innerText = 'Add';
  me.appendElementToHeader(addButton);
  var addEvent = new Event('onAddItem');
  addButton.addEventListener('click', function () {
    me.rootElement.dispatchEvent(addEvent);
  });
}

View.prototype.appendElementToHeader = function (element) {
  this.rootElement.querySelector('#header').appendChild(element);
}

View.prototype.renderTasksViewArea = function () {
  var displayArea = this.createAnElement('ul', { id: 'displayArea' });
  this.rootElement.appendChild(displayArea);
}

View.prototype.renderFooter = function () {
  var footer = this.createAnElement('div', { id: 'footer' });
  this.rootElement.appendChild(footer);
  this.renderItemCountView();
  this.renderItemsDisplayElement()
  // this.renderAllTaskButton();
  // this.renderCompletedTaskButton();
  // this.renderPendingTaskButton();
  // this.renderClearCompletedButton();
  this.renderSelectElement();
}

View.prototype.renderItemCountView = function () {
  var countMessage = this.createAnElement('span', { id: 'countMessage' });
  var taskCount = this.createAnElement('span', { id: 'taskCount' });
  countMessage.innerText = 'Total tasks: ';
  taskCount.innerText = 0;
  countMessage.appendChild(taskCount);
  this.appendElementToFooter(countMessage);
}

View.prototype.renderAllTaskButton = function () {
  var me = this;
  var allTaskButton = me.createAnElement('button', { id: 'allTaskButton' });
  allTaskButton.innerText = 'All Tasks';
  me.appendElementToFooter(allTaskButton);
  var allTaskEvent = new Event('showAllTasks');
  allTaskButton.addEventListener('click', function () {
    me.rootElement.dispatchEvent(allTaskEvent);
  });
}

View.prototype.renderCompletedTaskButton = function () {
  var me = this;
  var completedTaskButton = me.createAnElement('button', { id: 'completedTaskButton' });
  completedTaskButton.innerText = 'Completed';
  me.appendElementToFooter(completedTaskButton);
  var completedEvent = new Event('showCompletedTasks');
  completedTaskButton.addEventListener('click', function () {
    me.rootElement.dispatchEvent(completedEvent);
  });
}

View.prototype.renderPendingTaskButton = function () {
  var me = this;
  var pendingTaskButton = me.createAnElement('button', { id: 'pendingTaskButton' });
  pendingTaskButton.innerText = 'Pending';
  me.appendElementToFooter(pendingTaskButton);
  var pendingEvent = new Event('showPendingTasks');
  pendingTaskButton.addEventListener('click', function () {
    me.rootElement.dispatchEvent(pendingEvent);
  });
}

View.prototype.renderClearCompletedButton = function () {
  var me = this;
  var deleteButton = me.createAnElement('button', { id: 'clearCompleted' });
  deleteButton.innerText = 'Clear Completed';
  me.appendElementToFooter(deleteButton);
  var deleteButtonEvent = new Event('clearCompletedEvent');
  deleteButton.addEventListener('click', function () {
    me.rootElement.dispatchEvent(deleteButtonEvent);
  });
}

View.prototype.renderSelectElement = function () {
  var me = this;
  var selectElement = me.createAnElement('select', { id: 'storageDropDown' });
  this.renderOption(selectElement, 'Select Storage', { value: 'selectStorage' });
  this.renderOption(selectElement, 'Local Storage', {
    value: 'localStorage',
    selected: 'selected'
  });
  this.renderOption(selectElement, 'Session Storage', { value: 'sessionStorage' });
  // this.renderOption(selectElement, 'Web API', { value: 'webAPI' });
  me.appendElementToFooter(selectElement);
  var selectEvent = new Event('onStorageChange');
  selectElement.addEventListener('change', function () {
    me.rootElement.dispatchEvent(selectEvent);
  });
}

View.prototype.renderItemsDisplayElement = function () {
  var me = this;
  var selectElement = me.createAnElement('select', { id: 'itemsDisplayDropDown' });

  this.renderOption(selectElement, 'All Tasks', { value: 'allTaskButton', selected: 'selected' });
  this.renderOption(selectElement, 'Completed Tasks', { value: 'completedButton' });
  this.renderOption(selectElement, 'Pending Tasks', { value: 'pendingButton' });
  this.renderOption(selectElement, 'Clear Completed Tasks', { value: 'clearCompleted' });
  me.appendElementToFooter(selectElement);
  var selectEvent = new Event('onItemDisplayChange');
  selectElement.addEventListener('change', function () {
    me.rootElement.dispatchEvent(selectEvent);
  });
}

View.prototype.renderOption = function (selectElement, elementName, elementAttributes) {
  var option = this.createAnElement('option', elementAttributes);
  option.innerText = elementName;
  this.appendOptions(selectElement, option);
}

View.prototype.appendOptions = function (selectElement, option) {
  selectElement.appendChild(option);
}

View.prototype.appendElementToFooter = function (element) {
  this.rootElement.querySelector('#footer').appendChild(element);
}

View.prototype.showMessageOnInvalidStorage = function () {
  this.rootElement.querySelector('#displayArea').innerHTML = 'Please select your required storage to store data...';
}

View.prototype.createItem = function (itemId, item, status) {
  var li = this.createAnElement('li', { id: itemId });
  this.createCheckButton(li, status, itemId);
  this.createTextContent(li, item);
  this.createDeleteButton(li, itemId);
  this.appendItemToView(li);
}

View.prototype.createCheckButton = function (li, status, itemId) {
  var me = this;
  var checkBox = me.createAnElement('span', { id: 'check' });
  me.setItemClassName(checkBox, status);
  var checkBoxEvent = new CustomEvent('onCheckBoxChange', {
    detail: {
      id: itemId,
      currentElement: li,
      checkBox: checkBox,
    }
  });
  checkBox.addEventListener('click', function () {
    checkBox.classList.toggle('checked');
    me.rootElement.dispatchEvent(checkBoxEvent);
  });
  li.appendChild(checkBox);
}

View.prototype.createTextContent = function (li, item) {
  var taskNode = this.createAnElement('span', {});
  taskNode.innerText = item;
  li.appendChild(taskNode);
}

View.prototype.createDeleteButton = function (li, itemId) {
  var me = this;
  var deleteButton = me.createAnElement('SPAN', { class: 'close' });
  deleteButton.innerText = '\u2718';
  li.appendChild(deleteButton);
  var deleteEvent = new CustomEvent('deleteButtonEvent', {
    detail: {
      id: itemId,
      currentElement: li,
    }
  });
  deleteButton.addEventListener('click', function () {
    me.rootElement.dispatchEvent(deleteEvent);
  });
}

View.prototype.createAnElement = function (elementType, attributes) {
  var element = document.createElement(elementType, attributes);
  for (var key in attributes) {
    element.setAttribute(key, attributes[key]);
  }
  return element;
}


View.prototype.getItem = function () {
  return this.rootElement.querySelector('#taskInputField').value;
}

View.prototype.appendItemToView = function (item) {
  this.rootElement.querySelector('#displayArea').appendChild(item);
}

View.prototype.deleteItemFromView = function (item) {
  item.remove();
}

View.prototype.setItemClassName = function (checkBox, status) {
  if (status === true) {
    checkBox.classList = 'checked';
  }
}

View.prototype.displayStorageItems = function (storageData) {
  this.clearAllTasks();
  for (var key in storageData) {
    this.createItem(storageData[key].id, storageData[key].title, storageData[key].completed);
  }
}

View.prototype.clearAllTasks = function () {
  this.rootElement.querySelector('#displayArea').innerHTML = "";
}

View.prototype.resetAndFocusInputField = function () {
  var inputFieldElement = this.rootElement.querySelector('#taskInputField');
  inputFieldElement.value = '';
  inputFieldElement.focus();
}

View.prototype.handleEmptyContent = function (count, message = 'Your tasks list is empty.!') {
  const emptyElement = this.rootElement.querySelector('#emptyContent');
  if (count > 0) {
    emptyElement && emptyElement.remove();
  } else {
    this.rootElement.querySelector('#displayArea').innerHTML = `<div id='emptyContent'>${message}</div>`;
  }
}

View.prototype.displayItemsCount = function (count) {
  this.handleEmptyContent(count);
  this.rootElement.querySelector('#taskCount').innerHTML = count;
}

View.prototype.getStorageType = function () {
  return this.rootElement.querySelector('#storageDropDown').value;
}

View.prototype.getItemDisplayType = function() {
  return this.rootElement.querySelector('#itemsDisplayDropDown').value;
}
//   return new View(rootId);
// })();

// export default View;