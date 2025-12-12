// src/controllers/taskController.js
const Task = require('../models/Task');

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, status } = req.body;
    
    const task = new Task({
      userId: req.userId,
      title,
      description,
      dueDate,
      priority,
      status
    });
    
    await task.save();
    
    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all tasks for a user
exports.getTasks = async (req, res) => {
  try {
    // Extract query parameters for filtering
    const { status, priority, sortBy, sortOrder } = req.query;
    
    // Build the filter object
    const filter = { userId: req.userId };
    
    if (status) {
      filter.status = status;
    }
    
    if (priority) {
      filter.priority = priority;
    }
    
    // Build the sort object
    const sort = {};
    
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      // Default sort by creation date (newest first)
      sort.createdAt = -1;
    }
    
    const tasks = await Task.find(filter).sort(sort);
    
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific task
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error(error);
    
    // Check if error is due to invalid ID format
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, status } = req.body;
    
    // Create task update object
    const taskFields = {};
    if (title !== undefined) taskFields.title = title;
    if (description !== undefined) taskFields.description = description;
    if (dueDate !== undefined) taskFields.dueDate = dueDate;
    if (priority !== undefined) taskFields.priority = priority;
    if (status !== undefined) taskFields.status = status;
    
    // Add updated timestamp
    taskFields.updatedAt = Date.now();
    
    // Find and update the task
    let task = await Task.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: taskFields },
      { new: true }
    );
    
    res.json(task);
  } catch (error) {
    console.error(error);
    
    // Check if error is due to invalid ID format
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    await Task.findByIdAndRemove(req.params.id);
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    
    // Check if error is due to invalid ID format
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};
