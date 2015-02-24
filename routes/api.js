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

    _.each(item.subItems, function(subItem, index) {
      var subItem = db.getItemById(subItem.id);
      subItem.state = db.getStateById(subItem.state.id);
      item.subItems[index] = subItem
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

    _.each(item.subItems, function(subItem, index) {
      var subItem = db.getItemById(subItem.id);
      subItem.project = db.getProjectById(subItem.project.id);
      subItem.state = db.getStateById(subItem.state.id);
      item.subItems[index] = subItem
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

    _.each(item.subItems, function(subItem, index) {
      var subItem = db.getItemById(subItem.id);
      subItem.state = db.getStateById(subItem.state.id);
      item.subItems[index] = subItem
    });
  });

  response.json({
    data: items
  });
});

router.get('/items/:itemId', function(request, response) {
  var db = new DB();
  var item = db.getItemById(request.params.itemId);

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

  _.each(item.subItems, function(subItem, index) {
    var subItem = db.getItemById(subItem.id);
    subItem.state = db.getStateById(subItem.state.id);

    _.each(subItem.prerequisiteItems, function(prerequisiteItem, index) {
      var prerequisiteItem = db.getItemById(prerequisiteItem.id);
      prerequisiteItem.project = db.getProjectById(prerequisiteItem.project.id);
      prerequisiteItem.state = db.getStateById(prerequisiteItem.state.id);
      subItem.prerequisiteItems[index] = prerequisiteItem
    });

    item.subItems[index] = subItem
  });

  _.each(item.prerequisiteItems, function(item) {
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

    _.each(item.subItems, function(subItem, index) {
      var subItem = db.getItemById(subItem.id);
      subItem.state = db.getStateById(subItem.state.id);
      item.subItems[index] = subItem
    });
  });

  _.each(item.subItems, function(item) {
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

    _.each(item.subItems, function(subItem, index) {
      var subItem = db.getItemById(subItem.id);
      subItem.state = db.getStateById(subItem.state.id);
      item.subItems[index] = subItem
    });
  });

  response.json({
    data: item
  });
});

router.post('/items', function(request, response) {
  var item = {
    title: request.param('title'),
    description: request.param('description'),
    state: {
      id: request.param('state_id'),
    },
    project: {
      id: request.param('project_id'),
    },
  };

  if (request.param('tags'))
    item.tags = request.param('tags').split(' ');

  if (request.param('prerequisite_item_ids'))
    item.prerequisiteItems = _.map(request.param('prerequisite_item_ids').split(','), function(id) { return { id: id }; });

  if (request.param('sub_item_ids'))
    item.subItems = _.map(request.param('sub_item_ids').split(','), function(id) { return { id: id }; });

  if (request.param('assigned_user_ids'))
    item.assignedUsers = _.map(request.param('assigned_user_ids').split(','), function(id) { return { id: id }; });

  if (request.param('links'))
    item.links = _.map(request.param('links').split(','), function(url) { return { url: url }; });

  var db = new DB();
  db.saveItem(item);

  response.json({
    data: item
  });
});

router.patch('/items/:itemId', function(request, response) {
  var db = new DB();
  var item = db.getItemById(request.params.itemId);

  if (request.param('title') !== undefined)
    item.title = request.param('title');

  if (request.param('description') !== undefined)
    item.description = request.param('description');

  if (request.param('state_id') !== undefined)
    item.state = {
      id: request.param('state_id')
    };

  if (request.param('project_id') !== undefined)
    item.project = {
      id: request.param('project_id')
    };

  if (request.param('tags') !== undefined)
    item.tags = request.param('tags').split(' ');

  if (request.param('prerequisite_item_ids') !== undefined)
    if (request.param('prerequisite_item_ids') !== '')
      item.prerequisiteItems = _.map(request.param('prerequisite_item_ids').split(','), function(id) { return { id: id }; });
    else
      item.prerequisiteItems = undefined;

  if (request.param('sub_item_ids') !== undefined)
    if (request.param('sub_item_ids') !== '')
      item.subItems = _.map(request.param('sub_item_ids').split(','), function(id) { return { id: id }; });
    else
      item.subItems = undefined;

  if (request.param('assigned_user_ids') !== undefined)
    if (request.param('assigned_user_ids') !== '')
      item.assignedUsers = _.map(request.param('assigned_user_ids').split(','), function(id) { return { id: id }; });
    else
      item.assignedUsers = undefined;

  if (request.param('links') !== undefined)
    if (request.param('links') !== '')
      item.links = _.map(request.param('links').split(','), function(url) { return { url: url }; });
    else
      item.links = undefined;

  db.saveItem(item);

  response.json({
    data: item
  });
});

module.exports = router;
