const request = require("supertest");
const sinon = require("sinon");
const app = require("../index");
const { expect } = require("chai");
const { Task, Auditlogs: AuditLog, Tag, TaskTag } = require("../models");
const jwt = require("jsonwebtoken");


let token;
let taskId;

before(async () => {
  const res = await request(app).post("/login").send({
    email: "test@example.com",
    password: "123456",
  });
  token = res.body.accessToken;
});

afterEach(() => {
  sinon.restore();
});

describe("Authentication & Access Control", () => {
  it("should return 401 if no token is provided", async () => {
    const res = await request(app).get("/api/tasks/");
    expect(res.statusCode).to.equal(401);
    expect(res.body.message).to.include("No token");
  });

  it("should return 401 if token is invalid", async () => {
    const res = await request(app)
      .get("/api/tasks/")
      .set("Authorization", "Bearer invalid.token.value");
    expect(res.statusCode).to.equal(401);
    expect(res.body.message).to.include("Invalid");
  });
});

describe("Task Management", () => {
  it("should create a task", async () => {
    const res = await request(app)
      .post("/api/tasks/")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Task",
        description: "Testing task",
        priority: "high",
        status: "pending",
        dueDate: "2025-07-01",
      });
    expect(res.statusCode).to.equal(201);
    taskId = res.body.task.id;
  });

  it("should get all tasks", async () => {
    const res = await request(app)
      .get("/api/tasks/")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).to.equal(200);
    expect(res.body).to.be.an("array");
  });

  describe("GET /api/tasks (filtering)", () => {
  let findAllStub;
  let currentUserId;

  beforeEach(() => {
    const decoded = jwt.decode(token);
    currentUserId = decoded.id;
    findAllStub = sinon.stub(Task, "findAll").resolves([]);
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should filter by status", async () => {
    await request(app)
      .get("/api/tasks?status=completed")
      .set("Authorization", `Bearer ${token}`);

    const where = findAllStub.firstCall.args[0].where;
    expect(where).to.deep.equal({
      userId: currentUserId,
      status: "completed",
    });
  });

  it("should filter by priority", async () => {
    await request(app)
      .get("/api/tasks?priority=high")
      .set("Authorization", `Bearer ${token}`);

    const where = findAllStub.firstCall.args[0].where;
    expect(where).to.deep.equal({
      userId: currentUserId,
      priority: "high",
    });
  });

  it("should filter by id", async () => {
    await request(app)
      .get("/api/tasks?id=42")
      .set("Authorization", `Bearer ${token}`);

    const where = findAllStub.firstCall.args[0].where;
    expect(where).to.deep.equal({
      userId: currentUserId,
      id: "42",
    });
  });

  it("should apply multiple filters together", async () => {
    await request(app)
      .get("/api/tasks?status=pending&priority=medium&id=7")
      .set("Authorization", `Bearer ${token}`);

    const where = findAllStub.firstCall.args[0].where;
    expect(where).to.deep.equal({
      userId: currentUserId,
      status: "pending",
      priority: "medium",
      id: "7",
    });
  });
});

  it("should handle error when fetching tasks", async () => {
    const stub = sinon.stub(Task, "findAll").throws(new Error("DB error"));
    const res = await request(app)
      .get("/api/tasks/")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).to.equal(500);
  });

  it("should get a task by ID", async () => {
    const res = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).to.equal(200);
  });

  it("should handle DB error in getTaskById", async () => {
    sinon.stub(Task, "findByPk").throws(new Error("Simulated failure"));
    const res = await request(app)
      .get(`/api/tasks/1`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).to.equal(500);
  });


  it("should return 404 if task not found", async () => {
    const res = await request(app)
      .get("/api/tasks/99999")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).to.equal(404);
  });

  it("should simulate 403 for unauthorized task access", async () => {
    const stub = sinon.stub(Task, "findByPk").resolves({
      id: 1,
      userId: 999,
    });
    const res = await request(app)
      .get("/api/tasks/1")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).to.equal(403);
  });

  it("should return logs for a task", async () => {
    const res = await request(app)
      .get(`/api/tasks/${taskId}/logs`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).to.equal(200);
  });

  it("should return 404 if task not found in logs", async () => {
    sinon.stub(Task, "findByPk").resolves(null);
    const res = await request(app)
      .get(`/api/tasks/99999/logs`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).to.equal(404);
  });

  it("should return 403 if task logs accessed by another user", async () => {
    sinon.stub(Task, "findByPk").resolves({ userId: 999 });
    const res = await request(app)
      .get(`/api/tasks/1/logs`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).to.equal(403);
  });

  it("should return 404 if task not found in logs", async () => {
    sinon.stub(Task, "findByPk").resolves(null);
    const res = await request(app)
      .get(`/api/tasks/99999/logs`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).to.equal(404);
  });

  it("should return 403 if logs requested for another user's task", async () => {
    sinon.stub(Task, "findByPk").resolves({ id: 1, userId: 999 });
    const res = await request(app)
      .get(`/api/tasks/${taskId}/logs`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).to.equal(403);
  });

  it("should return 404 if task not found during log retrieval", async () => {
    sinon.stub(Task, "findByPk").resolves(null);
    const res = await request(app)
      .get(`/api/tasks/99999/logs`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).to.equal(404);
  });

  it("should return 403 if unauthorized to view logs", async () => {
    sinon.stub(Task, "findByPk").resolves({ userId: 999 });
    const res = await request(app)
      .get(`/api/tasks/${taskId}/logs`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).to.equal(403);
  });

  it("should simulate log failure", async () => {
    sinon.stub(AuditLog, "findAll").throws(new Error("Log fetch error"));
    const res = await request(app)
      .get(`/api/tasks/${taskId}/logs`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).to.equal(500);
  });

  it("should update a task", async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated Task" });
    expect(res.statusCode).to.equal(200);
  });

  it("should simulate unauthorized task update", async () => {
    sinon.stub(Task, "findByPk").resolves({ userId: 999 });
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Hack Task" });
    expect(res.statusCode).to.equal(403);
  });

  it("should return 404 when updating a non-existent task", async () => {
    sinon.stub(Task, "findByPk").resolves(null);
    const res = await request(app)
      .put("/api/tasks/99999")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Ghost update" });
    expect(res.statusCode).to.equal(404);
  });

  it("should handle error if update crashes", async () => {
    const decoded = jwt.decode(token);
    const currentUserId = decoded.id;

    sinon.stub(Task, "findByPk").resolves({
      userId: currentUserId,
      update: () => {
        throw new Error("Simulated failure");
      },
    });
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Crash it" });

    expect(res.statusCode).to.equal(500);
  });

  it("should simulate AuditLog failure on task creation", async () => {
    sinon.stub(AuditLog, "create").throws(new Error("AuditLog failure"));
    const res = await request(app)
      .post("/api/tasks/")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Fail AuditLog",
        priority: "medium",
        status: "in-progress",
        dueDate: "2025-08-01",
      });
    expect(res.statusCode).to.equal(201);
  });

  
  it("should return 500 if task creation fails", async () => {
    sinon.stub(Task, "create").throws(new Error("DB failure"));
    const res = await request(app)
      .post("/api/tasks/")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Fail",
        priority: "low",
        status: "in-progress",
        dueDate: "2025-10-01",
      });
    expect(res.statusCode).to.equal(500);
  });

   

it("should simulate Audit log failure during task updation", async () => {
  const { id: currentUserId } = jwt.decode(token);
  sinon.stub(Task, "findByPk").resolves({
    userId: currentUserId,
    update: sinon.stub().resolves({ id: taskId }), 
  });
  sinon.stub(AuditLog, "create").throws(new Error("Audit log fail"));
  const res = await request(app)
    .put(`/api/tasks/${taskId}`) 
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Fail Auditlog",
      priority: "medium",
      status: "pending",
      dueDate: "2025-09-01",
    });
  expect(res.statusCode).to.equal(200);
});
  

  it("should assign a tag to task", async () => {
    await request(app)
      .post("/api/tags")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Urgent" });
    const res = await request(app)
      .post(`/api/tasks/${taskId}/tags`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Urgent" });
    expect(res.statusCode).to.equal(201);
  });

  it("should return 404 for non-existent tag", async () => {
    const res = await request(app)
      .post(`/api/tasks/${taskId}/tags`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "NotATag" });
    expect(res.statusCode).to.equal(404);
  });

  it("should unassign an existing tag", async () => {
    const tag = await Tag.findOne({ where: { name: "Urgent" } });
    const res = await request(app)
      .delete(`/api/tasks/${taskId}/tags/${tag.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).to.equal(200);
  });

  it("should return 404 for missing tag in unassign", async () => {
    const res = await request(app)
      .delete(`/api/tasks/${taskId}/tags/99999`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).to.equal(404);
  });

  it("should return 404 if task does not exist in tag removal", async () => {
    sinon.stub(Task, "findByPk").resolves(null);
    const res = await request(app)
      .delete(`/api/tasks/99999/tags/1`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).to.equal(404);
  });

it("should return 500 if tag assignment fails", async () => {
  const { id: currentUserId } = jwt.decode(token);
  sinon.stub(Task, "findByPk").resolves({
    id: taskId,
    userId: currentUserId,
  });
  sinon.stub(Tag, "findAll").resolves([{ id: 1 }]);
  sinon.stub(TaskTag, "create").throws(new Error("Assignment failed"));
  const res = await request(app)
    .post(`/api/tasks/${taskId}/tags`)
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Urgent" });

  expect(res.statusCode).to.equal(500);
  expect(res.body.message).to.include("assigning the tag");
});

  it("should return 500 if TaskTag.destroy fails", async () => {
    const tag = await Tag.findOne({ where: { name: "Urgent" } });

    sinon.stub(TaskTag, "destroy").throws(new Error("Destroy failed"));
    const res = await request(app)
      .delete(`/api/tasks/${taskId}/tags/${tag.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).to.equal(500);
  });

  it("should return 404 if tag does not exist when deleting", async () => {
    sinon.stub(Tag, "findByPk").resolves(null);
    const res = await request(app)
      .delete(`/api/tasks/${taskId}/tags/99999`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).to.equal(404);
  });

  it("should handle DB error during tag removal", async () => {
    sinon.stub(TaskTag, "destroy").throws(new Error("Fail destroy"));
    const tag = await Tag.findOne({ where: { name: "Urgent" } });
    const res = await request(app)
      .delete(`/api/tasks/${taskId}/tags/${tag.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).to.equal(500);
  });

  it("should return 404 if tag to delete is not found", async () => {
    sinon.stub(Tag, "findByPk").resolves(null);
    const res = await request(app)
      .delete(`/api/tasks/${taskId}/tags/99999`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).to.equal(404);
  });

  it("should return 500 if error occurs while deleting tag", async () => {
    sinon.stub(TaskTag, "destroy").throws(new Error("Destroy crash"));
    const tag = await Tag.findOne({ where: { name: "Urgent" } });
    const res = await request(app)
      .delete(`/api/tasks/${taskId}/tags/${tag.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).to.equal(500);
  });

  it("should return 500 when TaskTag.destroy fails", async () => {
    sinon.stub(TaskTag, "destroy").throws(new Error("Destroy error"));
    const tag = await Tag.findOne({ where: { name: "Urgent" } });
    const res = await request(app)
      .delete(`/api/tasks/${taskId}/tags/${tag.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).to.equal(500);
  });

  it("should simulate unauthorized task deletion", async () => {
    sinon.stub(Task, "findByPk").resolves({ userId: 999 });
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Delete Task" });
    expect(res.statusCode).to.equal(403);
  });

  it("should delete a task", async () => {
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).to.equal(200);
  });

  it("should simulate Audit log failure during task deletion", async () => {
  const { id: currentUserId } = jwt.decode(token);
  sinon.stub(Task, "findByPk").resolves({
    id: taskId,
    userId: currentUserId,
    destroy: sinon.stub().resolves(),
  });
  sinon.stub(AuditLog, "create").throws(new Error("Audit log fail"));
  const res = await request(app)
    .delete(`/api/tasks/${taskId}`)
    .set("Authorization", `Bearer ${token}`);
  expect(res.statusCode).to.equal(200);
});

  it("should return 404 when deleting already deleted task", async () => {
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).to.equal(404);
  });
});

it("should return 500 if task deletion fails", async () => {
  const { id: currentUserId } = jwt.decode(token);
  sinon.stub(Task, "findByPk").resolves({
    id: taskId,
    userId: currentUserId,
    destroy: sinon.stub().throws(new Error("Destroy error")),
  });
  const res = await request(app)
    .delete(`/api/tasks/${taskId}`)
    .set("Authorization", `Bearer ${token}`);
  expect(res.statusCode).to.equal(500);
});