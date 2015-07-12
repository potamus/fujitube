'use strict';

var express = require('express');
var controller = require('./artist.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.get('/:id/videoid', controller.videoid);

module.exports = router;
