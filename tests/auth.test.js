const request = require("supertest");
const app = require("../index"); 
const { expect } = require("chai");
const sinon = require("sinon");
const { User } = require("../models");
const bcrypt = require("bcrypt");

let token = "";

describe("Auth APIs", () => {

    it("should register a user", async () => {
        const res = await request(app).post("/register").send({
            first_name: "Test",
            last_name: "User",
            email: `test${Date.now()}@example.com`,
            password: "123456",
            role: "user"
        });
        expect(res.statusCode).to.equal(201);
        expect(res.body).to.have.property("message");
    });

    it("should fail if email or password is missing", async () => {
        const res = await request(app).post("/register").send({
            first_name: "Test",
            last_name: "User",
            email: "", // missing
            password: "", // missing
            role: "user"
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.message).to.include("Email & Password required");
    });

    it("should fail if email format is invalid", async () => {
        const res = await request(app).post("/register").send({
            first_name: "Test",
            last_name: "User",
            email: "invalid-email",
            password: "123456",
            role: "user"
        });
        expect(res.statusCode).to.equal(400);
    });

    it("should fail if first_name is missing", async () => {
        const res = await request(app).post("/register").send({
            last_name: "User",
            email: `test_missing_first${Date.now()}@example.com`,
            password: "123456",
            role: "user"
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.message).to.include("first name and last name");
    });

    it("should fail if last_name is missing", async () => {
        const res = await request(app).post("/register").send({
            first_name: "Test",
            email: `test_missing_last${Date.now()}@example.com`,
            password: "123456",
            role: "user"
        });
        expect(res.statusCode).to.equal(400);
    });

    it("should fail if user already exists", async () => {
        const email = `duplicate${Date.now()}@example.com`;

        // First registration
        await request(app).post("/register").send({
            first_name: "Test",
            last_name: "User",
            email,
            password: "123456",
            role: "user"
        });

        // Attempt duplicate registration
        const res = await request(app).post("/register").send({
            first_name: "Test",
            last_name: "User",
            email, // same email
            password: "123456",
            role: "user"
        });

        expect(res.statusCode).to.equal(400);
        expect(res.body.message).to.include("User already exists");
    });

it("should return 500 if registration failed", async () => {
  sinon.stub(User, "create").throws(new Error("Simulated DB failure"));

  const res = await request(app)
  .post("/register")
  .send({
    first_name: "Demo",
    last_name: "User",
    email: "demo@example.com",
    password: "demo1234",
    role: "user"
  });

  expect(res.statusCode).to.equal(500);
  expect(res.body).to.have.property("message");
  expect(res.body.message).to.include("Registration Failed");
});

it("should return 500 if login failed", async () => {
  sinon.stub(User, "findOne").throws(new Error("Simulated DB failure"));

  const res = await request(app)
    .post("/login")
    .send({
      email: "test@example.com",
      password: "123456",
    });

  expect(res.statusCode).to.equal(500);
  expect(res.body).to.have.property("message");
  expect(res.body.message).to.include("Login Failed");
});

    it("should fail if email or password is missing", async () => {
        const res = await request(app).post("/login").send({
            email: "", 
            password: ""
        });
        expect(res.statusCode).to.equal(400);
        expect(res.body.message).to.include("Email & Password required");
    });

       it("should return 403 if password is invalid", async () => {
  sinon.stub(User, "findOne").resolves({
    id: 1,
    name: "Charitra",
    email: "charitra@example.com",
    password: await bcrypt.hash("correctpassword", 10),
  });

  const res = await request(app)
    .post("/login")
    .send({ email: "charitra@example.com", password: "wrongpassword" });

  expect(res.statusCode).to.equal(403);
  expect(res.body.message).to.include("Invalid password");
});

    it("should fail if user does not exist", async () => {
        const res = await request(app).post("/login").send({
            email: "nonexistent" + Date.now() + "@example.com",
            password: "123456"
        });
        expect(res.statusCode).to.equal(401);
        expect(res.body.message).to.include("User not found");
    });

});

module.exports = { token };