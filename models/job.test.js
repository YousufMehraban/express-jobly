"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  jobIDs,
  
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "new",
    salary: 100,
    equity: null,
    company_handle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    
    expect(job).toEqual({...newJob, id: expect.any(Number)});

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle
           FROM jobs`);
    // expect(result.rows[0]).toEqual(newJob);
  });

  test("bad request with dupe", async function () {
    try {
      await Job.create(newJob);
      await Job.create(newJob);
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe(" /get findAll", function () {
  test("works: without filter", async function () {
    let jobs = await Job.getAll();
    expect(jobs).toEqual([
    {
        title: 'testjob1', 
        salary: 500, 
        equity: "0.01", 
        company_handle: 'c1',
        id: expect.any(Number),
    }
    ]);
  });
});

/************************************** filter findAll based on title, minSalary, hasEquity */

describe("/get findAll({minSalary: 2000})", function () {
  test("works: with filter", async function () {
    let jobs = await Job.getAll({"minSalary": 2000});
    expect(jobs).toEqual([]);
  });
  test("works: with filter", async function () {
    let jobs = await Job.getAll({"minSalary": "300"});
    expect(jobs).toEqual([
      {
        title: 'testjob1', 
        salary: 500, 
        equity: "0.01", 
        company_handle: 'c1',
        id: expect.any(Number),
      }
    ]);
  });
  test("works: with filter", async function () {
    let jobs = await Job.getAll({title: 'test'});
    expect(jobs).toEqual([
      {
        title: 'testjob1', 
        salary: 500, 
        equity: "0.01", 
        company_handle: 'c1',
        id: expect.any(Number),
      }
    ]);
  });
});

/************************************** get */

describe("get/:id", function () {
  test("works", async function () {
    let job = await Job.get(`${jobIDs[0]}`);
    expect(job).toEqual(
      {
        title: 'testjob1', 
        salary: 500, 
        equity: "0.01", 
        company_handle: 'c1',
        id: expect.any(Number),
      });
  });
  test("not found if no such job", async function () {
    try {
      await Job.get(0);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "New",
    salary: 1000,
    equity: null,
  };

  test("works", async function () {
    // const res = await db.query(`SELECT id FROM jobs`)
    // const id = res.rows[0].id
    let job = await Job.update(jobIDs[0], updateData);
    expect(job).toEqual(
        {
        id: jobIDs[0],
        title: "New",
        salary: 1000,
        equity: null,
        company_handle: "c1",
        }
    );

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = $1`, jobIDs);
    expect(result.rows[0]).toEqual(
        {
        ...updateData,
        company_handle: "c1",
        id: jobIDs[0]
        }
    );
  });

  test("not found if no such job exists", async function () {
    const incorrectData = {
        title: "New",
        salary: 1000,
      };
    try {
      await Job.update(0, incorrectData);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(`${jobIDs[0]}`);
    const res = await db.query(
        `SELECT id FROM jobs WHERE id=$1`, jobIDs);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job exists", async function () {
    try {
      await Job.remove(0);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
