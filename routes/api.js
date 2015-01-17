var fs = require('fs');
var path = require('path');
var express = require('express');
var _ = require('underscore');
var router = express.Router();
var DB = require('../db.js');

router.get('/users', function(request, response) {
  var db = new DB();

  response.json({
    data: db.getUsers()
  });
});

router.get('/users/:userId', function(request, response) {
  var db = new DB();

  response.json({
    data: db.getUserById(request.params.userId)
  });
});

router.get('/users/:userId/avatar', function(request, response) {
  var avatarFile = path.resolve(path.join(__dirname, '/../db/user' + request.params.userId + '.png'))

  fs.exists(avatarFile, function(exists) {
    if (!exists) {
      response.redirect('/app/images/avatar.png');
      return;
    }

    response.sendFile(avatarFile);
  });
});

router.get('/users/:userId/items', function(request, response) {
  var db = new DB();
  var items = db.getItemsByAssignedUserId(request.params.userId);;

  _.each(items, function(item) {
    item.state = db.getStateById(item.state.id);
    item.project = db.getProjectById(item.project.id);

    _.each(item.assignedUsers, function(assignedUser, index) {
      item.assignedUsers[index] = db.getUserById(assignedUser.id);
    });

    _.each(item.prerequisiteItems, function(prerequisiteItem, index) {
      var prerequisiteItem = db.getItemById(prerequisiteItem.id);
      prerequisiteItem.state = db.getStateById(prerequisiteItem.state.id);
      item.prerequisiteItems[index] = prerequisiteItem
    });
  });

  response.json({
    data: items
  });
});

router.get('/states', function(request, response) {
  var db = new DB();

  response.json({
    data: db.getStates()
  });
});

router.get('/projects', function(request, response) {
  var db = new DB();

  response.json({
    data: db.getProjects()
  });
});

router.get('/projects/:projectId', function(request, response) {
  var db = new DB();

  response.json({
    data: db.getProjectById(request.params.projectId)
  });
});

router.get('/projects/:projectId/items', function(request, response) {
  var db = new DB();
  var items = db.getItemsByProjectId(request.params.projectId);

  _.each(items, function(item) {
    item.state = db.getStateById(item.state.id);

    _.each(item.assignedUsers, function(assignedUser, index) {
      item.assignedUsers[index] = db.getUserById(assignedUser.id);
    });

    _.each(item.prerequisiteItems, function(prerequisiteItem, index) {
      var prerequisiteItem = db.getItemById(prerequisiteItem.id);
      prerequisiteItem.project = db.getProjectById(prerequisiteItem.project.id);
      prerequisiteItem.state = db.getStateById(prerequisiteItem.state.id);
      item.prerequisiteItems[index] = prerequisiteItem
    });
  });

  response.json({
    data: items
  });
});

router.get('/items', function(request, response) {
  var db = new DB();
  var items = db.getItems();

  _.each(items, function(item) {
    item.state = db.getStateById(item.state.id);
    item.project = db.getProjectById(item.project.id);

    _.each(item.assignedUsers, function(assignedUser, index) {
      item.assignedUsers[index] = db.getUserById(assignedUser.id);
    });

    _.each(item.prerequisiteItems, function(prerequisiteItem, index) {
      var prerequisiteItem = db.getItemById(prerequisiteItem.id);
      prerequisiteItem.state = db.getStateById(prerequisiteItem.state.id);
      item.prerequisiteItems[index] = prerequisiteItem
    });
  });

  response.json({
    data: items
  });
});

module.exports = router;
