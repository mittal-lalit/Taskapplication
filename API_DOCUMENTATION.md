#  Task Management API Documentation

##  Authentication

### POST /api/auth/register

- **Request**:
```json
{
  "first_name": "Lalit",
  "last_name": "mittal",
  "email": "lalit@gmail.com",
  "password": "***********"
}

- **Response**;
{
  "message": "Registered",
  "user": { "email": "lalit@gmail.com" }
}

Status Code: 201 Created

POST /api/auth/login

Request:

{
  "email": "lalit@gmail.com",
  "password": "*********"
}

Response:

{
  "message": "Login success",
  "token": "JWT_TOKEN_HERE"
}

Status Code: 200 OK


*Tasks

GET /api/tasks
Requires Auth Header

Response:

[
  { "id": 1, "title": "Build API", "description": "Finish task API" }
]

Status: 200 OK

POST /api/tasks

Request:

{
  "title": "Learn Sequelize",
  "description": "Watch tutorials"
}
Response:
{
  "message": "Task Created",
  "task": { "id": 1, "title": "Learn Sequelize" }
}
Status: 201 Created

 * Tags

POST /api/tags
Request:{ "name": "Urgent" }
Status: 201 Created

* Task-Tag Mapping

POST /api/tasks/:id/tags
Request:
{ "tagId": 2 }

Status: 200 OK















