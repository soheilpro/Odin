var fs = require('fs');
var _ = require('underscore');

function DB() {
  this.data = JSON.parse(fs.readFileSync('db/db.json'));
}

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

module.exports = DB;
