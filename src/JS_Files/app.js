
function App(View, DataSource) {
  this.viewInstance = View;
  this.modelInstance = DataSource;
  this.storageTypes = this.modelInstance.storageTypes;
  this.buttonValues = this.viewInstance.buttonValues;
  this.buttonClicked;
  this.storageType;
}

App.prototype.init = function () {
  this.viewInstance.initialize();
  this.attachEvents();
  this.onStorageSelect();
}

App.prototype.attachEvents = function () {
  var events = {
    onAddItem: this.onAddClick.bind(this),
    onStorageChange: this.onStorageSelect.bind(this),
    onItemDisplayChange: this.onItemsDisplaySelect.bind(this),
    keypress: this.onEnter.bind(this),
    showAllTasks: this.onAllTasksClick.bind(this),
    showCompletedTasks: this.onCompletedClick.bind(this),
    showPendingTasks: this.onPendingClick.bind(this),
    onCheckBoxChange: this.onCheckBoxClick.bind(this),
    deleteButtonEvent: this.onDeleteClick.bind(this),
    clearCompletedEvent: this.onClearCompletedClick.bind(this),
  };
  for (var key in events) {
    this.viewInstance.rootElement.addEventListener(key, events[key]);
  }
};

App.prototype.onStorageSelect = function () {
  var viewInstance = this.viewInstance;
  this.buttonClicked = '';
  this.storageType = viewInstance.getStorageType();
  var storageData;
  if (this.storageType !== 'selectStorage') {
    viewInstance.clearAllTasks();
    storageData = this.modelInstance.getItemsFromStorage(this.storageType, this.onResponse.bind(this));
    viewInstance.displayStorageItems(storageData);
    // (this.storageType !== this.storageTypes.webAPI) ? this.itemsCount(storageData) : null;
    (this.storageType !== this.storageTypes.webAPI) ? viewInstance.displayItemsCount(storageData.length) : null
  }
  else {
    viewInstance.showMessageOnInvalidStorage();
    viewInstance.displayItemsCount(0);
  }
}

App.prototype.onEnter = function () {
  var viewInstance = this.viewInstance;
  if (event.keyCode === 13) {
    var inputElement = viewInstance.getItem();
    if (inputElement !== '' && this.storageType !== 'selectStorage') {
      this.addNewItem(inputElement, this.storageType);
      viewInstance.resetAndFocusInputField();
    }
  }
}

App.prototype.onAddClick = function () {
  var viewInstance = this.viewInstance;
  var inputElement = viewInstance.getItem();
  if (inputElement !== '' && this.storageType !== 'selectStorage') {
    this.addNewItem(inputElement, this.storageType);
    viewInstance.resetAndFocusInputField();
  }
}

App.prototype.addNewItem = function (inputElement, storageType) {
  var modelInstance = this.modelInstance;
  var id = modelInstance.addItemToStorage(inputElement, storageType, this.onResponse.bind(this));
  if (storageType !== this.storageTypes.webAPI) {
    if (this.buttonClicked !== this.buttonValues.completed) {
      this.viewInstance.createItem(id, inputElement);
    }
    this.itemsCount(modelInstance.getItemsFromStorage(storageType));
  }
}

App.prototype.onResponse = function (data) {
  if (this.storageType === this.storageTypes.webAPI) {
    if (this.buttonClicked !== this.buttonValues.completed) {
      this.displayItems(data);
    }
    this.modelInstance.getItemsFromStorage(this.storageType, this.itemsCount.bind(this));
  }
}

App.prototype.displayItems = function (data) {
  for (var i in data) {
    var id = this.modelInstance.getId(data[i].url);
    this.viewInstance.createItem(id, data[i].title, data[i].completed);
  }
}

App.prototype.itemsCount = function (storageData) {
  var itemsCount = this.modelInstance.getItemsUsingStatus(storageData, false).length;
  this.viewInstance.displayItemsCount(itemsCount);
}

App.prototype.onCheckBoxClick = function (e) {
  var viewInstance = this.viewInstance;
  var modelInstance = this.modelInstance;
  if (this.buttonClicked === this.buttonValues.completed || this.buttonClicked === this.buttonValues.pending) {
    viewInstance.deleteItemFromView(e.detail.currentElement);
  }
  var status = (e.detail.checkBox.classList.value === 'checked') ? true : false;
  if (this.storageType === this.storageTypes.webAPI) {
    modelInstance.updateStorageItem(this.storageType, e.detail.id, status);
    modelInstance.getItemsFromStorage(this.storageType, this.itemsCount.bind(this));
  } else {
    modelInstance.updateItemStatus(e.detail.id, this.storageType);
    var itemsCount = modelInstance.getItemsCount(this.storageType, !status);
    viewInstance.viewType !== 'allTaskButton' && viewInstance.viewType !== 'clearCompleted' && viewInstance.displayItemsCount(itemsCount);
  }
}

App.prototype.onDeleteClick = function (e) {
  var viewInstance = this.viewInstance;
  var modelInstance = this.modelInstance;
  viewInstance.deleteItemFromView(e.detail.currentElement);
  if (this.storageType === this.storageTypes.webAPI) {
    modelInstance.deleteItemFromStorage(this.storageType, e.detail.id);
    modelInstance.getItemsFromStorage(this.storageType, this.itemsCount.bind(this));
  } else {
    modelInstance.updateStorage(e.detail.id, this.storageType);
    modelInstance.getItemStatus(this.storageType, e.detail.id);
    var itemsCount = modelInstance.getItemsCount(this.storageType);
    viewInstance.displayItemsCount(itemsCount);
  }
}

App.prototype.onAllTasksClick = function () {
  this.viewInstance.viewType = 'allTaskButton';
  if (this.storageType !== 'selectStorage') {
    this.buttonClicked = this.buttonValues.allTasks;
    var storageData = this.modelInstance.getItemsFromStorage(this.storageType, this.onButtonClickResponse.bind(this));
    var itemsCount = this.modelInstance.getItemsCount(this.storageType);
    this.viewInstance.handleEmptyContent(itemsCount)
    this.viewInstance.displayStorageItems(storageData);
    this.viewInstance.displayItemsCount(itemsCount);
  }
}

App.prototype.onCompletedClick = function () {
  this.viewInstance.viewType = 'completedButton';
  const message = 'Your completed tasks list is empty.!'
  this.buttonClicked = this.buttonValues.completed;
  this.getItemsBasedOnStatus(true, message);
}

App.prototype.onPendingClick = function () {
  this.viewInstance.viewType = 'pendingButton'
  const message = 'Your pending tasks list is empty.!';
  this.buttonClicked = this.buttonValues.pending;
  this.getItemsBasedOnStatus(false, message);
}

App.prototype.getItemsBasedOnStatus = function (status, message) {
  var viewInstance = this.viewInstance;
  var modelInstance = this.modelInstance;
  if (this.storageType !== 'selectStorage') {
    var items = modelInstance.getItems(status, this.storageType, this.onButtonClickResponse.bind(this));
    var itemsCount = (this.storageType !== this.storageTypes.webAPI) ? modelInstance.getItemsCount(this.storageType) : null;
    viewInstance.displayStorageItems(items);
    viewInstance.displayItemsCount(items.length, message);
  }
}

App.prototype.onButtonClickResponse = function (data) {
  var items;
  var modelInstance = this.modelInstance;
  this.viewInstance.clearAllTasks();
  if (this.buttonClicked === this.buttonValues.allTasks) {
    this.displayItems(data);
  }
  if (this.buttonClicked === this.buttonValues.completed) {
    items = modelInstance.getItemsUsingStatus(data, true);
    this.displayItems(items);
  }
  if (this.buttonClicked === this.buttonValues.pending) {
    items = modelInstance.getItemsUsingStatus(data, false);
    this.displayItems(items);
  }
  if (this.buttonClicked === this.buttonValues.clearCompleted) {
    items = modelInstance.getItemsUsingStatus(data, true);
    for (var i in items) {
      var id = modelInstance.getId(items[i].url);
      modelInstance.deleteItemFromStorage(this.storageType, id);
    }
    modelInstance.getItemsFromStorage(this.storageType, this.onResponse.bind(this));
  }
  modelInstance.getItemsFromStorage(this.storageType, this.itemsCount.bind(this));
}

App.prototype.onClearCompletedClick = function () {
  this.viewInstance.viewType = 'clearCompleted'
  if (this.storageType !== 'selectStorage') {
    this.buttonClicked = this.buttonValues.clearCompleted;
    (this.storageType === this.storageTypes.webAPI) ? this.modelInstance.getItemsFromStorage(this.storageType, this.onButtonClickResponse.bind(this)) : this.clearCompletedTasks(this.storageType);
  }
}

App.prototype.clearCompletedTasks = function (storageType) {
  var modelInstance = this.modelInstance;
  var items = modelInstance.getItems(true, storageType);
  var storageData = modelInstance.getItemsFromStorage(storageType);
  for (var i in items) {
    storageData = modelInstance.updateArray(items[i].id, storageData);
  }
  modelInstance.setItemsToStorage(storageType, storageData);
  this.viewInstance.displayStorageItems(storageData);
  this.viewInstance.displayItemsCount(storageData.length);
}

App.prototype.onItemsDisplaySelect = function () {
  var viewInstance = this.viewInstance;
  this.buttonClicked = '';
  var itemDisplayType = viewInstance.getItemDisplayType();
  switch (itemDisplayType) {
    case 'allTaskButton': this.onAllTasksClick();
      break;
    case 'completedButton': this.onCompletedClick();
      break;
    case 'pendingButton': this.onPendingClick();
      break;
    case 'clearCompleted': this.onClearCompletedClick();
      break;
  }
}

// export default App;