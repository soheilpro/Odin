var fs = require('fs');
var uuid = require('node-uuid');
var _ = require('underscore');

function DB() {
  this.filename = __dirname + '/../db/db.json';
  this.data = JSON.parse(fs.readFileSync(this.filename));
}

DB.prototype.persist = function(callback) {
  fs.writeFile(this.filename, JSON.stringify(this.data, null, 2), callback);
};

DB.prototype.getUsers = function(callback) {
  callback(null, this.data.users);
};

DB.prototype.getUserById = function(userId, callback) {
  var user = _.find(this.data.users, function(user) {
    return user.id === userId;
  });

  callback(null, user);
};

DB.prototype.getStates = function(callback) {
  callback(null, this.data.states);
};

DB.prototype.getStateById = function(stateId, callback) {
  var state = _.find(this.data.states, function(state) {
    return state.id === stateId;
  });

  callback(null, state);
};

DB.prototype.getProjects = function(callback) {
  callback(null, this.data.projects);
};

DB.prototype.getProjectById = function(projectId, callback) {
  var project = _.find(this.data.projects, function(project) {
    return project.id === projectId;
  });

  callback(null, project);
};

DB.prototype.getItems = function(callback) {
  callback(null, this.data.items);
};

DB.prototype.getItemById = function(itemId, callback) {
  var item = _.find(this.data.items, function(item) {
    return item.id === itemId;
  });

  callback(null, item);
};

DB.prototype.saveItem = function(item, callback) {
  if (!item.id) {
    item.id = uuid.v4();
    this.data.items.push(item);
  }
  else {
    var index = _.findIndex(this.data.items, function(i) {
      return i.id === item.id;
    });

    this.data.items[index] = item;
  }

  this.persist(callback);
};

module.exports = DB;
