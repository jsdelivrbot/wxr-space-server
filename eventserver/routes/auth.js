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
  req.logout();
  res.redirect('/');
});


// signup
router.post('/signup', function(req, res) {

  console.log(`new register ${req.body.username}, ${req.body.password}`);

  let key = `user:${req.body.username}`;
  let user = {
    name: 'someone',
    password: req.body.password
  }

  client.hgetall(key, function(err, u) {

    if (err) {
      console.log('hgetall error');
      return res.redirect('/');
    }

    if (!u) {
      client.hmset(key, user, function(err) {

        if (err) {
          console.log('hmset error');
          return res.redirect('/');
        }

        req.login(user, function(err) {

          if (err) {
            console.log('req.login error');
          }

          return res.redirect('/');
        })
      });
    } else {
      console.log('user already exist!!!');
      return res.redirect('/');
    }
  });
});



module.exports = router;
