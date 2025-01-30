 function AbstractDataSource(key) {
    this.key = key;
}

AbstractDataSource.prototype.setData = function (storageType, data, callback) {
    this.getStorageInstance(storageType, this.key).setData(data, callback);
};

AbstractDataSource.prototype.getData = function (storageType, callback) {
    return this.getStorageInstance(storageType, this.key).getData(callback);
};

AbstractDataSource.prototype.deleteItem = function (storageType, id) {
    this.getStorageInstance(storageType).deleteItem(id);
};

AbstractDataSource.prototype.updateItem = function (storageType, id, status) {
    this.getStorageInstance(storageType).updateItem(id, status);
};

AbstractDataSource.prototype.getStorageInstance = function (storageType, key) {
    var storage = {
        'localStorage': function () {
            return new LocalStorage(key);
        },

        'sessionStorage': function () {
            return new SessionStorage(key);
        },

        'webAPI': function () {
            return new WebAPI();
        }
    }
    return storage[storageType]();
}

// export default AbstractDataSource;