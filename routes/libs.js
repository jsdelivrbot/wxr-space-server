const express = require('express');
const router = express.Router();
const path = require('path');


// jQuery
router.use('/jquery', express.static(path.join(__dirname, '../node_modules/jquery/dist')));   // jQeury
router.use('/jquery', express.static(path.join(__dirname, '../node_modules/jquery-autosize')));   // jQuery-autosize
router.use('/jquery', express.static(path.join(__dirname, '../node_modules/waypoints/lib')));   // jQuery-waypoints
router.use('/jquery', express.static(path.join(__dirname, '../node_modules/blueimp-file-upload/js')));   // jQuery-file-upload
router.use('/jquery/ui', express.static(path.join(__dirname, '../node_modules/jquery-ui/build')));
router.use('/jquery/ui', express.static(path.join(__dirname, '../node_modules/jquery-ui/ui')));

// bootstrap
router.use('/bootstrap', express.static(path.join(__dirname, '../node_modules/bootstrap/dist/js')));
router.use('/bootstrap', express.static(path.join(__dirname, '../node_modules/bootstrap/dist/css')));

// font-awesome
router.use('/font-awesome', express.static(path.join(__dirname, '../node_modules/font-awesome')));

// socket.io
router.use('/socket.io', express.static(path.join(__dirname, '../node_modules/socket.io-client/dist')));

// three.js
router.use('/three', express.static(path.join(__dirname, '../node_modules/three/build')));
router.use('/three/js', express.static(path.join(__dirname, '../node_modules/three/examples/js')));








module.exports = router;
