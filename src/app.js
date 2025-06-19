const express = require('express');
const app = express();
const taskRoutes = require('./routes/task.routes');
const tagRoutes = require('./routes/tag.routes');

app.use(express.json());

app.use('/api/tasks', taskRoutes);
app.use('/api/tags', tagRoutes);

app.listen(port,()=>{
console.log(`Server is running on port ${port}`);
})

module.exports = app;