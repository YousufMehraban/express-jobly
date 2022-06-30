"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
  job_IDs,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST OR CREATE /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "new",
    salary: 100,
    equity: null,
    company_handle: "c1",
  };

  test("ok for users", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {...newJob, id: expect.any(Number)}
    });
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "new",
          equity: 0.0,
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: 1,
          salary: 100,
          equity: 0.0,
          company_handle: 1
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
          [
            {
                id: expect.any(Number),
                title: "jobTest1", 
                salary: 500, 
                equity: null, 
                company_handle: "c1"
            },
          ],
    });
  });
});


describe("GET /jobs with filters", function () {
  test("filtering by minSalary=2000", async function () {
    const resp = await request(app).get("/jobs?minSalary=2000");
    expect(resp.body).toEqual({
      jobs:[],
    });
  });
});

describe("GET /jobs with filters", function () {
  test("filtering by minSalary=100", async function () {
    const resp = await request(app).get("/jobs?minSalary=100");
    expect(resp.body).toEqual({
      jobs:
          [
            {
                id: expect.any(Number),
                title: "jobTest1", 
                salary: 500, 
                equity: null, 
                company_handle: "c1"
            },
          ],
    });
  });
});



describe("GET /jobs with filters", function () {
  test("filtering by title containing 'job' ", async function () {
    const resp = await request(app).get("/jobs?title=job");
    expect(resp.body).toEqual({
      jobs:
          [
            {
                id: expect.any(Number),
                title: "jobTest1", 
                salary: 500, 
                equity: null, 
                company_handle: "c1"
            },
          ],
    });
  });
});



/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/${job_IDs[0]}`);
    expect(resp.body).toEqual({
      job: 
      {
        id: expect.any(Number),
        title: "jobTest1", 
        salary: 500, 
        equity: null, 
        company_handle: "c1"
      },
    });
  });

  test("found no such job", async function () {
    const resp = await request(app).get(`/companies/0`);
    expect(resp.statusCode).toEqual(404);
  });
})

/************************************** PATCH /jobs/:id */

describe("PATCH /job/:id", function () {
  test("works for users", async function () {
    const resp = await request(app)
        .patch(`/jobs/${job_IDs[0]}`)
        .send({
          title: "jobNew",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "jobNew", 
        salary: 500, 
        equity: null, 
        company_handle: "c1"
      },
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/jobs/${job_IDs[0]}`)
        .send({
          title: "wrongJob",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("found no such job", async function () {
    const resp = await request(app)
        .patch(`/jobs/0`)
        .send({
          name: "new nope",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
        .patch(`/jobs/${job_IDs[0]}`)
        .send({
          title: 1,
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for users", async function () {
    const resp = await request(app)
        .delete(`/jobs/${job_IDs[0]}`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: `${job_IDs[0]}`});
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/jobs/${job_IDs[0]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("found for no such job", async function () {
    const resp = await request(app)
        .delete(`/jobs/0`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});


