var express = require('express');
var router = express.Router();

router.get('/main', function(request, response) {
  response.render('templates/main');
});

module.exports = router;
