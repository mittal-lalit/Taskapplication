const {Sequelize}=require('sequelize');
require('dotenv').config();
 
 
const sequelize=new Sequelize(process.env.DB_NAME,process.env.DB_USERNAME,process.env.DB_PASSWORD,{
host:process.env.DB_HOST,
dialect:process.env.DIALECT
});
 
try {
sequelize.authenticate();
  console.log('Database Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}
 
module.exports={sequelize};
 