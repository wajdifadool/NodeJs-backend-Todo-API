const express = require('express');
const { getSample } = require('../controllers/sample');
const router = express.Router();

router.get('/', getSample);

module.exports = router;
