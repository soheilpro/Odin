var fs = require('fs');
var express = require('express');
var _ = require('underscore');
var router = express.Router();

function loadDB() {
  return JSON.parse(fs.readFileSync('db.json'));
}

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
  });

  response.json({
    data: items
  });
});

module.exports = router;
