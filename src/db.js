var fs = require('fs');
var uuid = require('node-uuid');
var _ = require('underscore');

function DB() {
  this.filename = __dirname + '/../db/db.json';
  this.data = JSON.parse(fs.readFileSync(this.filename));
}

DB.prototype.persist = function() {
  fs.writeFileSync(this.filename, JSON.stringify(this.data, null, 2));
};

DB.prototype.getUsers = function() {
  return this.data.users;
};

DB.prototype.getUserById = function(userId) {
  return _.find(this.data.users, function(user) {
    return user.id === userId;
  })
};

DB.prototype.getStates = function() {
  return this.data.states;
};

DB.prototype.getStateById = function(stateId) {
  return _.find(this.data.states, function(state) {
    return state.id === stateId;
  })
};

DB.prototype.getProjects = function() {
  return this.data.projects;
};

DB.prototype.getProjectById = function(projectId) {
  return _.find(this.data.projects, function(project) {
    return project.id === projectId;
  })
};

DB.prototype.getItems = function() {
  return this.data.items;
};

DB.prototype.getItemsByProjectId = function(projectId) {
  return _.filter(this.data.items, function(item) {
    return item.project.id === projectId;
  });
};

DB.prototype.getItemsByAssignedUserId = function(userId) {
  return _.filter(this.data.items, function(item) {
    return _.any(item.assignedUsers, function(assignedUser) {
      return assignedUser.id === userId;
    });
  });
};

DB.prototype.getItemById = function(itemId) {
  return _.find(this.data.items, function(item) {
    return item.id === itemId;
  })
};

DB.prototype.saveItem = function(item) {
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

  this.persist();
};

module.exports = DB;
