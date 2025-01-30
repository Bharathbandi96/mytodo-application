// import AbstractDataSource from './abstractDataSource';

function LocalStorage(storageKey) {
    this.key = storageKey;
}

LocalStorage.prototype.getData = function () {
    return JSON.parse(localStorage.getItem(this.key)) || [];
};

LocalStorage.prototype.setData = function (data) {
    localStorage.setItem(this.key, JSON.stringify(data));
};

function SessionStorage(storageKey) {
    this.key = storageKey;
}

SessionStorage.prototype.getData = function () {
    return JSON.parse(sessionStorage.getItem(this.key)) || [];
};

SessionStorage.prototype.setData = function (data) {
    sessionStorage.setItem(this.key, JSON.stringify(data));
};

function WebAPI() {
    this.xhr = new XMLHttpRequest();
    this.url = 'https://todo-backend-express.herokuapp.com/';
}

WebAPI.prototype.getData = function (callback) {
    this.sendRequest('GET', null, callback);
};

WebAPI.prototype.setData = function (data, callback) {
    this.sendRequest('POST', data, callback);
};
//prepareData
WebAPI.prototype.sendRequest = function (method, data, callback) {
    this.xhr.open(method, this.url, true);
    this.xhr.setRequestHeader('Content-Type', 'application/JSON');
    this.xhr.send(JSON.stringify(data));
    this.xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
            (method === 'POST') ? callback([JSON.parse(this.response)]) : callback(JSON.parse(this.response));
        }
    };
}

WebAPI.prototype.deleteItem = function (id) {
    this.xhr.open('DELETE', this.url + id, true);
    this.xhr.send(null);
};

WebAPI.prototype.updateItem = function (id, status) {
    this.xhr.open('PATCH', this.url + id, true);
    this.xhr.setRequestHeader('Content-type', 'application/json');
    this.xhr.send(JSON.stringify({ 'completed': status }));
};

// var DataSource = (function () {
function DataSource(storageKey) {
    this.storageKey = storageKey;
    this.storageTypes = {
        localStorage: 'localStorage',
        sessionStorage: 'sessionStorage',
        webAPI: 'webAPI'
    };
    this.storageInstance = new AbstractDataSource(this.storageKey);
}

DataSource.prototype.addItemToStorage = function (item, storageType, callback) {
    var itemId = this.createId();
    var data;
    // for (var key in this.storageTypes) {
    if (storageType !== 'webAPI') {
        data = this.getItemsFromStorage(storageType);
        data.push({ id: itemId, title: item, completed: false });
    } else {
        data = { 'title': item, 'order': null, 'completed': '', 'url': '' };
    }
    this.setItemsToStorage(storageType, data, callback);
    // }
    return itemId;
}

DataSource.prototype.createId = function () {
    return Date.now().toString();
}
////
DataSource.prototype.getId = function (url) {
    // return url.slice(42);
    return url.match(/\d+$/);
    // return url.substring(url.lastIndexOf('/')+1);
    // return url.split('/').pop();
}

DataSource.prototype.setItemsToStorage = function (selectedStorage, storageData, callback) {
    this.storageInstance.setData(selectedStorage, storageData, callback);
}

DataSource.prototype.updateItemStatus = function (id, selectedStorage) {
    var storageData = this.getItemsFromStorage(selectedStorage);
    var itemIndex = storageData.findIndex(function (object) {
        return object.id === id;
    });
    storageData[itemIndex].completed = !storageData[itemIndex].completed;
    this.setItemsToStorage(selectedStorage, storageData);
}

DataSource.prototype.getItems = function (itemStatus, selectedStorage, callback) {
    var storageData = this.getItemsFromStorage(selectedStorage, callback);
    var items = (selectedStorage !== 'webAPI') ? this.getItemsUsingStatus(storageData, itemStatus) : null;
    return items;
}

DataSource.prototype.getItemStatus = function(selectedStorage, itemId) {
    var storageData = this.storageInstance.getData(selectedStorage);
    var item = storageData.filter(function (item) {
        return item.id === itemId;
    });
    // return storageData.length;
    console.log(item);
}

DataSource.prototype.updateStorage = function (id, selectedStorage) {
    var storageData = this.getItemsFromStorage(selectedStorage);
    var updatedArray = this.updateArray(id, storageData);
    this.setItemsToStorage(selectedStorage, updatedArray);
}

DataSource.prototype.updateArray = function (id, storageData) {
    return storageData.filter(function (item) {
        return item.id !== id;
    });
}

DataSource.prototype.getItemsCount = function (selectedStorage, status=undefined) {
    var storageData = this.getItemsFromStorage(selectedStorage);
    var items = storageData.filter(function (item) {
        return item.completed === status;
    });
    return status!==undefined ? items.length: storageData.length;
}

DataSource.prototype.getItemsFromStorage = function (selectedStorage, callback) {
    return this.storageInstance.getData(selectedStorage, callback);
}

DataSource.prototype.deleteItemFromStorage = function (selectedStorage, id) {
    this.storageInstance.deleteItem(selectedStorage, id);
}

DataSource.prototype.updateStorageItem = function (selectedStorage, id, status) {
    this.storageInstance.updateItem(selectedStorage, id, status);
}
DataSource.prototype.getItemsUsingStatus = function (data, status) {
    var items = data.filter(function (item) {
        return item.completed === status;
    });
    return items;
}

//     return new DataSource(key)
// })()

// export default DataSource;