// src/routes/tasks.js
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create a task
router.post('/', taskController.createTask);

// Get all tasks
router.get('/', taskController.getTasks);

// Get a specific task
router.get('/:id', taskController.getTask);

// Update a task
router.put('/:id', taskController.updateTask);

// Delete a task
router.delete('/:id', taskController.deleteTask);

module.exports = router;
