const { Task } = require('../../models');
const { Tag } = require('../../models');
const { TaskTag } = require('../../models');
const { Op } = require('sequelize');
const { Auditlogs: AuditLog } = require("../../models");

// get /tasks =read tasks by user

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (task) {
  if (task.userId !== req.user.id) {
    return res.status(403).json({ message: "Unauthorized" });
  }
  await task.update(req.body);
  return res.status(200).json({ message: "Task updated", task });
}
return res.status(404).json({ message: "Task not found" });

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
      tags,
    } = req.query;
    const whereClause = {
      userId: req.user.id,
    };

    // Apply filters

    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (id) whereClause.id = id;
    const sort = sortBy
      ? [[sortBy, sortOrder === "desc" ? "DESC" : "ASC"]]
      : [];
    const pageLimit = parseInt(limit) || 10;
    const pageOffset = parseInt(offset) || 0;
    const tagList = tags ? tags.split(",") : [];
    const includeClause =
      tagList.length > 0
        ? [
          {
            model: Tag,
            where: {
              name: {
                [Op.in]: tagList,
              },
            },
            through: { attributes: [] },
          },
        ]
        : [];
    const tasks = await Task.findAll({
      where: whereClause,
      include: includeClause,
      order: sort,
      limit: pageLimit,
      offset: pageOffset,
    });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve tasks", error: error.message });
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
    try {
      await AuditLog.create({
        userId: req.user.id,
        taskId: task.id,
        action: 'CREATE',
        details: JSON.stringify(task)
      });
    } catch (logErr) {
      console.error("Failed to write audit log:", logErr.message);
    }


    console.log(" AuditLog type:", typeof AuditLog);

    res.status(201).json({ message: "Task created", task });
  } catch (error) {
    console.log("error", error)
    res.status(500).json({ message: "Failed to create task", error: error.message });
  }
};

// put / tasks/:id  - update task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await task.update(req.body);

    //  Log updated
    try {
      await AuditLog.create({
        userId: req.user.id,
        taskId: task.id,
        action: 'UPDATE',
        details: JSON.stringify(req.body)
      });
    } catch (logErr) {
      console.error("Failed to write audit log:", logErr.message);
    }
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
    await task.destroy(); 
    try {
      await AuditLog.create({
        userId: req.user.id,
        taskId: task.id,
        action: 'DELETE',
        details: JSON.stringify(task)
      });
    } catch (logErr) {
      console.error("Failed to write audit log:", logErr.message);
    }
    res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }};
// GET /tasks/:id/logs
exports.getTaskLogs = async (req, res) => {
  try {
    const taskId = req.params.id;

    const task = await Task.findByPk(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found', success: false });
    if (task.userId !== req.user.id)
      return res.status(403).json({ message: 'Unauthorized', success: false });
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






//Assign tag to a task
exports.assignTag = async (req, res) => {
  const { id: taskId } = req.params;
  try {
    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    const tag = await Tag.findAll({ where: { name: req.body.name } });
    if (!tag || tag.length === 0) {
      return res.status(404).json({ message: 'Tag not available', success: false });
    }


    await TaskTag.create({
      taskId: task.id,
      tagId: tag[0].id
    });

    res.status(201).json({
      message: 'Tag linked successfully',
    });
  } catch (error) {
    console.error('Tag assignment failed:', error.message);
    res.status(500).json({ message: 'Something went wrong while assigning the tag' });
  }
};

exports.deleteTag = async (req, res) => {
  const { id, tagId } = req.params;
  try {
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
     }
    const tag = await Tag.findByPk(tagId);
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found', success: false });
    }

    await TaskTag.destroy({
      where: {
        taskId: id,
        tagId: tagId
      }
    });
    res.status(200).json({ message: 'Tag removed from task successfully' });
  } catch (error) {
    console.error('Error removing tag from task:', error.message);
    res.status(500).json({ message: 'Failed to remove tag from task' });
  }
};