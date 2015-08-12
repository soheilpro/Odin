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

    async.each(users, function(user, callback) {
      expandUser(user, db, callback);
    }, function(error) {
      response.json({
        data: users
      });
    });
  });
});

router.post('/users', function(request, response, next) {
  var user = {
  };

  if (request.param('name'))
    user.name = request.param('name');

  var db = new DB();

  db.saveUser(user, function(error, user) {
    if (error) {
      next(error);
      return;
    }

    expandUser(user, db, function(error) {
      if (error) {
        next(error);
        return;
      }

      response.json({
        data: user
      });
    });
  });
});

router.patch('/users/:userId', function(request, response, next) {
  var db = new DB();

  db.getUserById(request.param('userId'), function(error, user) {
    if (error) {
      next(error);
      return;
    }

    if (request.param('name') !== undefined)
      if (request.param('name'))
        user.name = request.param('name');
      else
        user.name = undefined;

    db.saveUser(user, function(error, user) {
      if (error) {
        next(error);
        return;
      }

      expandUser(user, db, function(error) {
        if (error) {
          next(error);
          return;
        }

        response.json({
          data: user
        });
      });
    });
  });
});

function expandUser(user, db, callback) {
  if (!user.name)
    user.name = '';

  callback();
}

router.get('/projects', function(request, response, next) {
  var db = new DB();

  db.getProjects(function(error, projects) {
    if (error) {
      next(error);
      return;
    }

    async.each(projects, function(project, callback) {
      expandProject(project, db, callback);
    }, function(error) {
      response.json({
        data: projects
      });
    });
  });
});

router.post('/projects', function(request, response, next) {
  var project = {
  };

  if (request.param('name'))
    project.name = request.param('name');

  if (request.param('group'))
    project.group = request.param('group');

  var db = new DB();

  db.saveProject(project, function(error, project) {
    if (error) {
      next(error);
      return;
    }

    expandProject(project, db, function(error) {
      if (error) {
        next(error);
        return;
      }

      response.json({
        data: project
      });
    });
  });
});

router.patch('/projects/:projectId', function(request, response, next) {
  var db = new DB();

  db.getProjectById(request.param('projectId'), function(error, project) {
    if (error) {
      next(error);
      return;
    }

    if (request.param('name') !== undefined)
      if (request.param('name'))
        project.name = request.param('name');
      else
        project.name = undefined;

    if (request.param('group') !== undefined)
      if (request.param('group'))
        project.group = request.param('group');
      else
        project.group = undefined;

    db.saveProject(project, function(error, project) {
      if (error) {
        next(error);
        return;
      }

      expandProject(project, db, function(error) {
        if (error) {
          next(error);
          return;
        }

        response.json({
          data: project
        });
      });
    });
  });
});

function expandProject(project, db, callback) {
  if (!project.name)
    project.name = '';

  if (!project.group)
    project.group = '';

  callback();
}

router.get('/states', function(request, response, next) {
  var db = new DB();

  db.getStates(function(error, states) {
    if (error) {
      next(error);
      return;
    }

    async.each(states, function(state, callback) {
      expandState(state, db, callback);
    }, function(error) {
      response.json({
        data: states
      });
    });
  });
});

router.post('/states', function(request, response, next) {
  var state = {
  };

  if (request.param('title'))
    state.title = request.param('title');

  if (request.param('type'))
    state.type = request.param('type');

  if (request.param('color'))
    state.color = request.param('color');

  var db = new DB();

  db.saveState(state, function(error, state) {
    if (error) {
      next(error);
      return;
    }

    expandState(state, db, function(error) {
      if (error) {
        next(error);
        return;
      }

      response.json({
        data: state
      });
    });
  });
});

router.patch('/states/:stateId', function(request, response, next) {
  var db = new DB();

  db.getStateById(request.param('stateId'), function(error, state) {
    if (error) {
      next(error);
      return;
    }

    if (request.param('title') !== undefined)
      if (request.param('title'))
        state.title = request.param('title');
      else
        state.title = undefined;

    if (request.param('type') !== undefined)
      if (request.param('type'))
        state.type = request.param('type');
      else
        state.type = undefined;

    if (request.param('color') !== undefined)
      if (request.param('color'))
        state.color = request.param('color');
      else
        state.color = undefined;

    db.saveState(state, function(error, state) {
      if (error) {
        next(error);
        return;
      }

      expandState(state, db, function(error) {
        if (error) {
          next(error);
          return;
        }

        response.json({
          data: state
        });
      });
    });
  });
});

function expandState(state, db, callback) {
  if (!state.title)
    state.title = '';

  if (!state.type)
    state.type = '';

  if (!state.color)
    state.color = '';

  callback();
}

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

  db.getItemById(request.param('itemId'), function(error, item) {
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

  db.getItemById(request.param('itemId'), function(error, item) {
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

  db.getItemById(request.param('itemId'), function(error, item) {
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
