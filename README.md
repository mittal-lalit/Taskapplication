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


# API Endpoints

# Auth Routes

# POST /api/auth/register — Register a new user

# POST /api/auth/login — Login and receive a JWT

# Task Routes (Protected)

# GET /api/tasks — Get all tasks (with optional filters, sort, pagination)

# GET /api/tasks/:id — Get task by ID

# POST /api/tasks — Create a new task

# PUT /api/tasks/:id — Update a task

# DELETE /api/tasks/:id — Delete a task

# GET /api/tasks/:id/logs — Get audit logs of a task

# Tag Routes (Protected)

# POST /api/tags — Create a new tag

# POST /api/tasks/:id/tags — Assign a tag to a task

# DELETE /api/tasks/:id/tags/:tagId — Remove a tag from a task

# Filters and Sorting (for GET /tasks)

# ?status=completed

# ?priority=high

#  ?tags=Work,Personal

# ?sortBy=dueDate&order=asc

# ?limit=10&offset=0

# Testing

# Use the following command to run tests and coverage:

# npm run coverage

# Mocha + Chai for assertions

# Supertest for API testing

#  NYC for code coverage

#  Test Files:

#  tests/auth.test.js

#  tests/task.test.js

#  tests/tag.test.js




