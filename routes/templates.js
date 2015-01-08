var express = require('express');
var router = express.Router();

router.get('/projects', function(request, response) {
  response.render('templates/projects');
});

router.get('/project', function(request, response) {
  response.render('templates/project');
});

module.exports = router;
