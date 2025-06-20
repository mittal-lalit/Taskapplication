const { Task } = require('../../models');

// get /tasks =read tasks by user 
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({where:{userId: req.user.id}});
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message  });
  }
};

// post /tasks - create task

exports.createTask = async (req, res) => {
  try {
    const{title ,description , priority , status , dueDate} = req.body;
    if(!title || !description || !priority || !status || !dueDate)
      return res.status(400).json({message :"title ,description , priority , status , dueDate are required"})
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


