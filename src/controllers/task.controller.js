// const { status } = require('server/reply');
const { Task , Auditlogs: AuditLog } = require("../../models");

// get /tasks =read tasks by user

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.userId !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};


exports.getAllTasks = async (req, res) => {
  try {
    const {
      status,
      priority,
      sortBy,
      id,
      order: sortOrder,
      limit,
      offset,
    } = req.query;

    const whereClause = {
      userId: req.user.id,
    };

    // Filters
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (id) whereClause.id = id; // for optional filter by task id

    const sort = sortBy ? [[sortBy, sortOrder === "desc" ? "DESC" : "ASC"]] : [];

    const pageLimit = parseInt(limit) || 10;
    const pageOffset = parseInt(offset) || 0;

    const tasks = await Task.findAll({
      where: whereClause,
      order: sort,
      limit: pageLimit,
      offset: pageOffset,
    });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

// post /tasks - create task

exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, status, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      priority,
      status,
      dueDate,
      userId: req.user.id,
    });

     //  Log creation
    await AuditLog.create({
      userId: req.user.id,
      taskId: task.id,
      action: 'CREATE',
      details: JSON.stringify(task)
    });
    
   console.log(" AuditLog type:", typeof AuditLog);

    res.status(201).json({ message: "Task created", task });
  } catch (error) {
      console.log("error", error)
    res
      .status(500)
      .json({ message: "Failed to create task", error: error.message });
  }
};

// put / tasks/:id  - update task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.userId !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    await task.update(req.body);

     //  Log updated
    await AuditLog.create({
      userId: req.user.id,
      taskId: task.id,
      action: 'UPDATE',
      details: JSON.stringify(req.body)
    });


    res.status(200).json({ message: "Task updated", task });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /tasks/:id - Delete task

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.userId !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    await task.destroy(); // Or implement soft delete here

     //  Log deletion
    await AuditLog.create({
      userId: req.user.id,
      taskId: task.id,
      action: 'DELETE',
      details: JSON.stringify(task)
    });

    res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
 
// GET /tasks/:id/logs
exports.getTaskLogs = async (req, res) => {
  try {
    const taskId = req.params.id;

    const task = await Task.findByPk(taskId);
    if (!task || task.userId !== req.user.id) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }

    const logs = await AuditLog.findAll({
      where: {
        taskId,
        userId: req.user.id
      },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ logs });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch logs', error: error.message });
  }
};







