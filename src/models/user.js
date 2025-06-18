const { sequelize } = require("../../config/db");

const {DataTypes}=require('sequelize');

const User=sequelize.define("User",{
    first_name:{
        type:DataTypes.STRING,
        allownull:false
    },
    last_name:{
        type:DataTypes.STRING,
        allownull:false
    },
    email:{
        type:DataTypes.STRING,
        allownull:false
    },
    password:{
        type:DataTypes.STRING,
        allownull:false
    }
})

module.exports={User};
