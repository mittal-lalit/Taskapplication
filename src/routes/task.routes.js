const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');

// Basic Routes
router.get('/', taskController.getAllTasks);
router.post('/', taskController.createTask);

module.exports = router;


