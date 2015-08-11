var fs = require('fs');
var path = require('path');
var express = require('express');
var async = require('async');
var _ = require('underscore');
var router = express.Router();
var DB = require('../db.js');

router.get('/users', function(request, response, next) {
  var db = new DB();

  db.getUsers(function(error, users) {
    if (error) {
      next(error);
      return;
    }

    response.json({
      data: users
    });
  });
});

router.get('/projects', function(request, response, next) {
  var db = new DB();

  db.getProjects(function(error, projects) {
    if (error) {
      next(error);
      return;
    }

    response.json({
      data: projects
    });
  });
});

router.get('/states', function(request, response, next) {
  var db = new DB();

  db.getStates(function(error, states) {
    if (error) {
      next(error);
      return;
    }

    response.json({
      data: states
    });
  });
});

router.get('/items', function(request, response, next) {
  var db = new DB();

  db.getItems(function(error, items) {
    if (error) {
      next(error);
      return;
    }

    async.each(items, function(item, callback) {
      expandItem(item, db, callback);
    }, function(error) {
      response.json({
        data: items
      });
    });
  });
});

router.post('/items', function(request, response, next) {
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

  db.saveItem(item, function(error, item) {
    if (error) {
      next(error);
      return;
    }

    expandItem(item, db, function(error) {
      if (error) {
        next(error);
        return;
      }

      response.json({
        data: item
      });
    });
  });
});

router.patch('/items/:itemId', function(request, response, next) {
  var db = new DB();

  db.getItemById(request.params.itemId, function(error, item) {
    if (error) {
      next(error);
      return;
    }

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

    db.saveItem(item, function(error, item) {
      if (error) {
        next(error);
        return;
      }

      expandItem(item, db, function(error) {
        if (error) {
          next(error);
          return;
        }

        response.json({
          data: item
        });
      });
    });
  });
});

router.post('/items/:itemId/subitems', function(request, response, next) {
  var db = new DB();

  db.getItemById(request.params.itemId, function(error, item) {
    if (error) {
      next(error);
      return;
    }

    if (!item.subItems)
      item.subItems = [];

    item.subItems.push({
      id: request.param('item_id')
    });

    db.saveItem(item, function(error, item) {
      if (error) {
        next(error);
        return;
      }

      response.sendStatus(200);
    });
  });
});

router.delete('/items/:itemId/subitems/:subItemId', function(request, response, next) {
  var db = new DB();

  db.getItemById(request.params.itemId, function(error, item) {
    if (error) {
      next(error);
      return;
    }

    item.subItems = _.reject(item.subItems, function(subItem) {
      return subItem.id === request.param('subItemId');
    });

    db.saveItem(item, function(error, item) {
      if (error) {
        next(error);
        return;
      }

      response.sendStatus(200);
    });
  });
});

module.exports = router;

function expandItem(item, db, callback) {
  if (!item.type)
    item.type = 'issue';

  if (!item.title)
    item.title = '';

  if (!item.description)
    item.description = '';

  if (!item.tags)
    item.tags = [];

  if (!item.prerequisiteItems)
    item.prerequisiteItems = [];

  if (!item.subItems)
    item.subItems = [];

  if (!item.assignedUsers)
    item.assignedUsers = [];

  async.parallel([
    function(callback) {
      if (!item.state) {
        callback();
        return;
      }

      db.getStateById(item.state.id, function(error, state) {
        if (error) {
          callback(error);
          return;
        }

        item.state = state;
        callback();
      });
    },
    function(callback) {
      if (!item.project) {
        callback();
        return;
      }

      db.getProjectById(item.project.id, function(error, project) {
        if (error) {
          callback(error);
          return;
        }

        item.project = project;
        callback();
      });
    },
    function(callback) {
      async.each(item.prerequisiteItems, function(prerequisiteItem, callback) {
        db.getItemById(prerequisiteItem.id, function(error, item2) {
          if (error) {
            callback(error);
            return;
          }

          item.prerequisiteItems[item.prerequisiteItems.indexOf(prerequisiteItem)] = item2;
          expandItem(item2, db, callback);
        });
      }, function(error) {
        callback(error);
      });
    },
    function(callback) {
      async.each(item.subItems, function(subItem, callback) {
        db.getItemById(subItem.id, function(error, item2) {
          if (error) {
            callback(error);
            return;
          }

          item.subItems[item.subItems.indexOf(subItem)] = item2;
          expandItem(item2, db, callback);
        });
      }, function(error) {
        callback(error);
      });
    },
    function(callback) {
      async.each(item.assignedUsers, function(assignedUser, callback) {
        db.getUserById(assignedUser.id, function(error, user) {
          if (error) {
            callback(error);
            return;
          }

          item.assignedUsers[item.assignedUsers.indexOf(assignedUser)] = user;
          callback();
        });
      }, function(error) {
        callback(error);
      });
    }
  ],
  function(error) {
    callback(error);
  });
}
