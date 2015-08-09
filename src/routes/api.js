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

router.get('/projects', function(request, response) {
  var db = new DB();

  response.json({
    data: db.getProjects()
  });
});

router.get('/states', function(request, response) {
  var db = new DB();

  response.json({
    data: db.getStates()
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

router.post('/items', function(request, response) {
  var item = {
  };

  if (request.param('type'))
    item.type = request.param('type');
  else
    item.type = 'issue';

  if (request.param('title'))
    item.title = request.param('title');

  if (request.param('description'))
    item.description = request.param('description');

  if (request.param('state_id'))
    item.state = {
      id: request.param('state_id'),
    };

  if (request.param('project_id'))
    item.project = {
      id: request.param('project_id'),
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
    if (request.param('title'))
      item.title = request.param('title');
    else
      item.title = undefined;

  if (request.param('description') !== undefined)
    if (request.param('description'))
      item.description = request.param('description');
    else
      item.description = undefined;

  if (request.param('state_id') !== undefined)
    if (request.param('state_id'))
      item.state = {
        id: request.param('state_id')
      };
    else
      item.state = undefined;

  if (request.param('project_id') !== undefined)
    if (request.param('project_id'))
      item.project = {
        id: request.param('project_id')
      };
    else
      item.project = undefined;

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

router.post('/items/:itemId/subitems', function(request, response) {
  var db = new DB();
  var item = db.getItemById(request.params.itemId);

  if (!item.subItems)
    item.subItems = [];

  item.subItems.push({
    id: request.param('item_id')
  });

  db.saveItem(item);

  response.sendStatus(200);
});

router.delete('/items/:itemId/subitems/:subItemId', function(request, response) {
  var db = new DB();
  var item = db.getItemById(request.params.itemId);

  item.subItems = _.reject(item.subItems, function(subItem) {
    return subItem.id === request.param('subItemId');
  });

  db.saveItem(item);

  response.sendStatus(200);
});

module.exports = router;

function expandItem(item, db) {
  if (!item.type)
    item.type = 'issue';

  if (!item.title)
    item.title = '';

  if (!item.description)
    item.description = '';

  if (item.state)
    item.state = db.getStateById(item.state.id);

  if (item.project)
    item.project = db.getProjectById(item.project.id);

  if (!item.tags)
    item.tags = [];

  if (!item.prerequisiteItems)
    item.prerequisiteItems = [];

  if (!item.subItems)
    item.subItems = [];

  if (!item.assignedUsers)
    item.assignedUsers = [];

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

  _.each(item.assignedUsers, function(assignedUser, index) {
    item.assignedUsers[index] = db.getUserById(assignedUser.id);
  });
}
