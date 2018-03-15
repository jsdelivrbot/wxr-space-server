var express = require('express');
var router = express.Router();
var path = require('path');


// socket.io
router.use('/socket.io', express.static(path.join(__dirname, '../node_modules/socket.io-client/dist')));

// w3-css
router.use('/w3css', express.static(path.join(__dirname, '../node_modules/w3-css')));

// font-awesome
router.use('/font-awesome', express.static(path.join(__dirname, '../node_modules/font-awesome')));

// three.js
router.use('/three', express.static(path.join(__dirname, '../node_modules/three/build')));
router.use('/three/js', express.static(path.join(__dirname, '../node_modules/three/examples/js')));

// jQuery
router.use('/jquery', express.static(path.join(__dirname, '../node_modules/jquery/dist')));


module.exports = router;
