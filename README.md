# Taskapplication
# install dependencies((express, sequelize, mysql2, bcrypt, jsonwebtoken, dotenv))
#  Setup folder structure (src/ with models, routes, controllers, services, middlewares)
# Configure Sequelize and database connection
#  Create User model and migration

# Create API Design Documentation
(list of endpoints, request/response, status codes)
# Design ERD and schema for:
User
Task
Tag
TaskTag (many-to-many relation)

# Entities -  User,Task,Tag,TaskTag
# Relationships - User(one) -> Task(many) , Task(many) -> Tag(many) using TaskTAG

# ERD Diagram (ASCII version)

# USER-ID(PK, AUTO INCREMENT),FIRST_NAME(STRING, REQUIRED),LAST_NAME(STRING, REQUIRED),EMAIL(STRING, UNIQUE,REQUIRED) , PASSWORD( STRING , REQUIRED)->Task (1to many) 
# Task - ID(PK, AUTO INCREMENT), TITLE(STRING , REQUIRED) , DESCRIPTION(TEXT) , USERID(FK -> USER) -> TAG (M TO M)
# TAG - ID(PK, AUTO INCREMENT), NAME(STRING, UNIQUE, REQUIRED)
# TASKTAG - TASKID(FK -> TASK) , TAGID(FK-> TAG)

