const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');

// Basic Routes
router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', taskController.createTask);
router.put('/:id',  taskController.updateTask);
router.delete('/:id', taskController.deleteTask);
// getTaskLogs
router.get('/:id/logs', taskController.getTaskLogs); 
router.post('/:id/tags',taskController.assignTag);
router.delete('/:id/tags/:tagId',taskController.deleteTag) 

module.exports = router;


    