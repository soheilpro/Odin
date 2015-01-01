var fs = require('fs');
var express = require('express');
var router = express.Router();

var db = JSON.parse(fs.readFileSync('db.json'));

router.get('/states', function(request, response) {
  response.json({
    data: db.states
  });
});

router.get('/items', function(request, response) {
  response.json({
    data: db.items
  });
});

module.exports = router;
