var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Express',
    user: req.user
  });
});

router.get('/view', function(req, res, next) {
  res.render('view', {
    title: 'Express',
    user: req.user
  });
});

module.exports = router;
