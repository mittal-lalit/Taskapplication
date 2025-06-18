const express=require('express');
const { sequelize } = require('./config/db');
const { User } = require('./src/models/user');
const port=process.env.PORT || 3000;
const app=express();

// const syncModel=async()=>{
// try{
//     await User.sync();
//     console.log("User model synced successfully");
// }catch(error){
//     console.log("Error syncing model : ",error);
// }
// }

// syncModel();

app.listen(port,()=>{
console.log(`Server is running on port ${port}`);
})