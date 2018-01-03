var express = require('express');
var router = express.Router();
var path = require('path');


// socket.io
router.use('/socket.io', express.static(path.join(__dirname, '../node_modules/socket.io-client/dist')));

// w3-css
router.use('/w3css', express.static(path.join(__dirname, '../node_modules/w3-css')));

// three.js
router.use('/threejs', express.static(path.join(__dirname, '../node_modules/three/build')));



module.exports = router;
