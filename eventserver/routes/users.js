var express = require('express');
var router = express.Router();

// default login process
router.get('/auth/login',
    passport.authenticate('local'),
    function(req, res) {
        // If this function gets called, authentication was successful.
        // `req.user` contains the authenticated user.
        res.redirect('/users/' + req.user.username);
    });

});

module.exports = router;
