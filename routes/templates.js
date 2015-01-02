var express = require('express');
var router = express.Router();

router.get('/items', function(request, response) {
  response.render('templates/items');
});

module.exports = router;
