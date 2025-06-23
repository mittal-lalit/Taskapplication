const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');

// Basic Routes
router.get('/', taskController.getAllTasksByTags);
router.post('/', taskController.createTask);
router.put('/:id',taskController.updateTask);
router.delete('/:id',taskController.deleteTask)
router.post('/:id/tags',taskController.assignTag);
router.delete('/:id/tags/:tagId',taskController.deleteTag)

module.exports = router;


    