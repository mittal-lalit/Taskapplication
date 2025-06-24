const request = require("supertest");
const app = require("../index");
const sinon = require("sinon");
const { expect } = require("chai");
const { Tag } = require("../models");


let token;



before(async () => {
  const res = await request(app).post("/login").send({
    email: "test@example.com",
    password: "123456",
  });
  token = res.body.accessToken;
});

describe("Tag APIs", () => {
  let tagName = `Urgent-${Date.now()}`;

  describe("POST /api/tags", () => {
    it("should create a new tag", async () => {
      const res = await request(app)
        .post("/api/tags/")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: tagName });

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property("tag");
      expect(res.body.tag.name).to.equal(tagName);
    });

    it("should return 400 for missing tag name", async () => {
      const res = await request(app)
        .post("/api/tags/")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "" });

      expect(res.statusCode).to.equal(400);
      expect(res.body.message).to.include("Tag name is required");
    });

    it("should return 409 for duplicate tag name", async () => {
      const res = await request(app)
        .post("/api/tags/")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: tagName });

      expect(res.statusCode).to.equal(409);
      expect(res.body.message).to.include("Tag already exists");
    });


it("should return 500 if tag creation fails", async () => {
  sinon.stub(Tag, "findOne").resolves(null); 
  sinon.stub(Tag, "create").throws(new Error("Simulated DB error"));

  const res = await request(app)
    .post("/api/tags")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Explode" });

  expect(res.statusCode).to.equal(500);
  expect(res.body).to.have.property("error");
  expect(res.body.message).to.include("Failed to create tag");
});

  });

  describe("GET /api/tags", () => {
    it("should return all tags", async () => {
      const res = await request(app)
        .get("/api/tags/")
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property("tags");
      expect(Array.isArray(res.body.tags)).to.be.true;
    });

it("should return 500 if get all tags fail", async () => {
  sinon.stub(Tag, "findAll").throws(new Error("Tag retrieval failed"));
  const res = await request(app)
    .get("/api/tags/")
    .set("Authorization", `Bearer ${token}`);
  expect(res.statusCode).to.equal(500);
  expect(res.body.message).to.include("failed");
});
  });

  describe("POST /api/tasks/:id/tags", () => {
    let taskId;

    before(async () => {
      const res = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Tagged Task",
          description: "Task with a tag",
          priority: "medium",
          status: "pending",
          dueDate: "2025-07-10",
        });
      taskId = res.body.task.id;
    });

    it("should assign a tag to task", async () => {
      const res = await request(app)
        .post(`/api/tasks/${taskId}/tags`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: tagName });

      expect(res.statusCode).to.equal(201);
      expect(res.body.message).to.include("Tag linked");
    });

    it("should return 404 if task not found", async () => {
      const res = await request(app)
        .post(`/api/tasks/99999/tags`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: tagName });

      expect(res.statusCode).to.equal(404);
      expect(res.body.message).to.include("Task not found");
    });

    it("should return 404 if tag does not exist", async () => {
      const res = await request(app)
        .post(`/api/tasks/${taskId}/tags`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "NonexistentTag" });

      expect(res.statusCode).to.equal(404);
      expect(res.body.message).to.include("Tag not available");
    });
  });
});