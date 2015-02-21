var express = require('express');
var router = express.Router();

router.get('/overview', function(request, response) {
  response.render('templates/overview');
});

router.get('/users', function(request, response) {
  response.render('templates/users');
});

router.get('/user', function(request, response) {
  response.render('templates/user');
});

router.get('/projects', function(request, response) {
  response.render('templates/projects');
});

router.get('/project', function(request, response) {
  response.render('templates/project');
});

router.get('/item', function(request, response) {
  response.render('templates/item');
});

router.get('/new-item', function(request, response) {
  response.render('templates/addEditItem');
});

module.exports = router;
