const { Task } = require('../../models');
const {Tag} = require('../../models');
const {TaskTag} = require('../../models');
const { Op } = require('sequelize');

// get /tasks =read tasks by user 
exports.getAllTasksByTags = async (req, res) => {
  try {
   const { tags } = req.query;
const tagList = tags ? tags.split(',') : [];
const tasks = await Task.findAll({
  where: {
    userId: req.user.id
  },
  include: tagList.length > 0
    ? [{
        model: Tag,
        where: {
          name: {
            [Op.in]: tagList
          }
        },
        through: { attributes: [] } 
      }]
    : []
});
res.status(201).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message  });
  }
};

// post /tasks - create task

exports.createTask = async (req, res) => {
  try {
    const{title ,description , priority , status , dueDate} = req.body;
    const task = await Task.create({
      title,
      description,
      priority,
      status,
      dueDate,
      userId: req.user.id
    }); 

    res.status(201).json({message:"Task created", task});
  } catch (error) {
    res.status(500).json({ messager: 'Failed to create task', error: error.message });
  }
};


// put / tasks/:id  - update task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.userId !== req.user.id) return res.status(403).json({ message: "Unauthorized" });

    await task.update(req.body);
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
    if (task.userId !== req.user.id) return res.status(403).json({ message: "Unauthorized" });

    await task.destroy(); // Or implement soft delete here
    res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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
    if (!tag) {
      return res.status(404).json({ message: 'Tag not available' });
    }

    await TaskTag.create({
      taskId: task.id,
      tagId: tag[0].id
    });

    res.status(200).json({
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
    const tag=await Tag.findByPk(tagId);
    
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