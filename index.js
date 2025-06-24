const express=require('express');
const taskRoutes = require('./src/routes/task.routes');
const tagRoutes = require('./src/routes/tag.routes');
const authMiddleware = require('./src/middlewares/auth.middleware');
const authRoutes=require("./src/routes/auth.routes");
const port=process.env.PORT || 3000;
const app=express();

app.use(express.json());




app.use(authRoutes);

app.use(authMiddleware)
app.use('/api/tasks',  taskRoutes);
app.use('/api/tags', tagRoutes);




app.listen(port,()=>{
console.log(`Server is running on port ${port}`);
})


module.exports = app;