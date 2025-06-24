const { expect } = require("chai");
const sinon = require("sinon");
const Sequelize = require("sequelize");

describe("Sequelize Initialization", () => {
  let originalEnvVar;

  beforeEach(() => {
    originalEnvVar = process.env.DATABASE_URL;
  });

  afterEach(() => {
    sinon.restore();
    process.env.DATABASE_URL = originalEnvVar;
    delete require.cache[require.resolve("../models")]; 
  });

  it("should initialize Sequelize using env variable if defined", () => {
  process.env.DATABASE_URL = "mysql://user:pass@localhost:3306/testdb";
  process.env.NODE_ENV = "development";

  const config = require("../config/config.js");
  config.development.use_env_variable = "DATABASE_URL";

  delete require.cache[require.resolve("../models")];
  const models = require("../models");

  expect(models.sequelize.options.dialect).to.equal("mysql");
});

  it("should initialize Sequelize with manual credentials if env variable not defined", () => {
  delete process.env.DATABASE_URL;
  
  const config = require("../config/config.js");
  config.development.use_env_variable = undefined;

  delete require.cache[require.resolve("../models")];

  const models = require("../models");
  const options = models.sequelize.options;

  expect(["root", "user"]).to.include(options.username); 
  expect(options.database).to.exist;
  expect(["mysql", "postgres"]).to.include(options.dialect);
});
});