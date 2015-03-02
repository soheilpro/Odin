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
    expandItem(item, db);
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
  var project = db.getProjectById(request.params.projectId);
  var items = db.getItemsByProjectId(request.params.projectId);

  _.each(items, function(item) {
    expandItem(item, db);
  });

  items = _.sortBy(items, function(item) {
    var index = _.findIndex(project.items, function(projectItem) {
      return projectItem.id === item.id;
    });

    return index !== -1 ? index : Number.MAX_VALUE;
  });

  response.json({
    data: items
  });
});

router.get('/items', function(request, response) {
  var db = new DB();
  var items = db.getItems();

  _.each(items, function(item) {
    expandItem(item, db);
  });

  response.json({
    data: items
  });
});

router.get('/tasks', function(request, response) {
  var db = new DB();
  var states = db.getStates()
  var items = db.getItems();

  _.each(items, function(item) {
    expandItem(item, db);
  });

  var doableStateIds = _.pluck(_.filter(db.getStates(), function(state) {
    return state.type === 'ready' ||
           state.type === 'inprogress';
  }), 'id');

  var doneStateIds = _.pluck(_.filter(db.getStates(), function(state) {
    return state.type === 'finished';
  }), 'id');

  items = _.filter(items, function(item) {
    return _.contains(doableStateIds, item.state.id);
  });

  items = _.filter(items, function(item) {
    return _.every(item.prerequisiteItems, function(prerequisiteItem) {
      return _.contains(doneStateIds, prerequisiteItem.state.id);
    });
  });

  response.json({
    data: items
  });
});

router.get('/items/:itemId', function(request, response) {
  var db = new DB();
  var item = db.getItemById(request.params.itemId);

  expandItem(item, db);

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

  expandItem(item, db);

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

  expandItem(item, db);

  response.json({
    data: item
  });
});

router.put('/items/:itemId/state', function(request, response) {
  var db = new DB();
  var item = db.getItemById(request.params.itemId);
  var oldState = db.getStateById(item.state.id);
  var newState = db.getStateById(request.param('state_id'));

  item.state = {
    id: newState.id
  };

  db.saveItem(item);

  if (oldState.type === 'pending' && newState.type === 'ready') {
    function updatePrerequisiteItems(item) {
      _.each(item.prerequisiteItems, function(prerequisiteItem) {
        prerequisiteItem = db.getItemById(prerequisiteItem.id);

        if (db.getStateById(prerequisiteItem.state.id).type === 'pending') {
          prerequisiteItem.state = {
            id: newState.id
          };

          db.saveItem(prerequisiteItem);
        }

        updatePrerequisiteItems(prerequisiteItem);
      });
    }

    updatePrerequisiteItems(item);
  }

  expandItem(item, db);

  response.json({
    data: item
  });
});

module.exports = router;

function expandItem(item, db) {
  item.state = db.getStateById(item.state.id);
  item.project = db.getProjectById(item.project.id);

  if (!item.description)
    item.description = '';

  if (!item.tags)
    item.tags = [];

  if (!item.assignedUsers)
    item.assignedUsers = [];

  if (!item.prerequisiteItems)
    item.prerequisiteItems = [];

  if (!item.subItems)
    item.subItems = [];

  _.each(item.assignedUsers, function(assignedUser, index) {
    item.assignedUsers[index] = db.getUserById(assignedUser.id);
  });

  _.each(item.prerequisiteItems, function(prerequisiteItem, index) {
    var prerequisiteItem = db.getItemById(prerequisiteItem.id);
    expandItem(prerequisiteItem, db);
    item.prerequisiteItems[index] = prerequisiteItem
  });

  _.each(item.subItems, function(subItem, index) {
    var subItem = db.getItemById(subItem.id);
    expandItem(subItem, db);
    item.subItems[index] = subItem
  });
}
