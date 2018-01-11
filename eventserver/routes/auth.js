var express = require('express');
var router = express.Router();
var passport = require('passport');

// default login process
router.post('/login', passport.authenticate('local', {
    successRedirect: '/javascript:alert("login!!!")',
    failureRedirect: '/javascript:alert("fail to lgo in")',
    failureFlash: false
  })
);

// default logout process
router.get('/logout', function(req, res) {
  req.session.destroy(function(err) {
    if (err) {
      console.log(err);
    }
    console.log('logout');

    res.redirect('/');
  });
});



module.exports = router;
