var fs = require('fs');
var path = require('path');
var express = require('express');
var _ = require('underscore');
var router = express.Router();

function loadDB() {
  return JSON.parse(fs.readFileSync('db/db.json'));
}

router.get('/users', function(request, response) {
  var db = loadDB();

  response.json({
    data: db.users
  });
});

router.get('/users/:userId', function(request, response) {
  var db = loadDB();

  response.json({
    data: _.find(db.users, function(user) { return user.id === request.params.userId; })
  });
});

router.get('/users/:userId/avatar', function(request, response) {
  response.sendFile(path.resolve(path.join(__dirname, '/../db/user' + request.params.userId + '.png')));
});

router.get('/users/:userId/items', function(request, response) {
  var db = loadDB();
  var items = _.filter(db.items, function(item) { return _.any(item.assignedUsers, function(assignedUser) { return assignedUser.id === request.params.userId; })});

  _.each(items, function(item) {
    item.state = _.find(db.states, function(state) { return state.id === item.state.id; });
    item.project = _.find(db.projects, function(project) { return project.id === item.project.id; });

    _.each(item.assignedUsers, function(assignedUser, index) {
      item.assignedUsers[index] = _.find(db.users, function(user) { return user.id === assignedUser.id; });
    });
  });

  response.json({
    data: items
  });
});

router.get('/states', function(request, response) {
  var db = loadDB();

  response.json({
    data: db.states
  });
});

router.get('/projects', function(request, response) {
  var db = loadDB();

  response.json({
    data: db.projects
  });
});

router.get('/projects/:projectId', function(request, response) {
  var db = loadDB();

  response.json({
    data: _.find(db.projects, function(project) { return project.id === request.params.projectId; })
  });
});

router.get('/projects/:projectId/items', function(request, response) {
  var db = loadDB();
  var items = _.filter(db.items, function(item) { return item.project.id === request.params.projectId; });

  _.each(items, function(item) {
    item.state = _.find(db.states, function(state) { return state.id === item.state.id; });

    _.each(item.assignedUsers, function(assignedUser, index) {
      item.assignedUsers[index] = _.find(db.users, function(user) { return user.id === assignedUser.id; });
    });
  });

  response.json({
    data: items
  });
});

module.exports = router;
