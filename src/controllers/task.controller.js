const { Task } = require('../../models');

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({where:{userId: req.user.id}});
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message  });
  }
};
 
 
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
    res.status(200).json({message:"Task created", task});
  } catch (error) {
    res.status(500).json({ message: 'Failed to create task', error: error.message });
  }
};
 
 