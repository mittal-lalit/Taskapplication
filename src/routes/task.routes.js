const express = require('express');
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const taskController = require('../controllers/task.controller');

// Basic Routes
router.get('/', auth, taskController.getAllTasks);
router.post('/', auth,taskController.createTask);
router.put('/:id', auth, taskController.updateTask);
router.delete('/:id', auth, taskController.deleteTask);

module.exports = router;


