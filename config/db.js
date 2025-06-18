const {Sequelize}=require('sequelize');
require('dotenv').config();


const sequelize=new Sequelize("TaskApplication","root",process.env.dbPassword,{
host:"localhost",
dialect:"mysql"
});

try {
sequelize.authenticate();
  console.log('Database Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

module.exports={sequelize};