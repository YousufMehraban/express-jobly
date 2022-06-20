"use strict";

const db = require('../db')
const { BadRequestError, NotFoundError, ExpressError } = require("../expressError");

// functions to get list of all companies, add, update and delete jobs

class Job {

    // finding all jobs
    // {title: "engineering", minSalary: 100000, hasEquity: true} => {jobs: [ {}, .... ] }

    // can specify filters, returing a list of all matching jobs

    static async getAll(search={}){
        
        const {title, minSalary, hasEquity} = search
        let queryLine = `SELECT id, title, salary, equity, company_handle FROM jobs`;

        let valuesArray = [];
        let searchTerms = [];

        if(title !== undefined){
            valuesArray.push(`%${title}%`)
            searchTerms.push(`title = ILIKE $${valuesArray.length}`)
        }

        if(minSalary !== undefined){
            valuesArray.push(+minSalary)
            searchTerms.push(`salary >= $${valuesArray.length}`)
        }

        if(hasEquity === true){
            searchTerms.push('equity > 0')
        }else{
            searchTerms.push('equity = 0')
        }
        
        // constructing final queryLine
        if(searchTerms.length > 0){
            queryLine +=  ' WHERE ' + searchTerms.join(' AND ')
        }
        queryLine += ` ORDER BY title`
        const jobs = await db.query(queryLine, valuesArray)
        return jobs.rows

    }


    // find a job by id
    // returning {job:{...}}

    static async get(id){
        const job = await db.query(`SELECT id, title, salary, equity, company_handle 
                                    FROM jobs WHERE id = $1`, [id])
        
        if (!job) throw new NotFoundError();
        return job.rows[0]
    }


    // creating a new job
    // check if job already exists throw error
    // {title: "engineering", salary: 150000, enquity = 0.0, company_handle: 'smith-llc'} => { job }

    static async create({title, salary, equity, company_handle}){
        const duplicateCheck = await db.query(`SELECT title FROM jobs 
                                                WHERE title = $1 AND 
                                                company_handle = $2
                                                `, [title, company_handle]);
        if (duplicateCheck.rows[0]) throw new ExpressError('Duplicate Job', 400)

        const newJob = await db.query(`INSERT INTO jobs (title, salary, equity, company_handle)
                                        VALUES ($1, $2, $3, $4)
                                        RETURNING id, title, salary, equity, company_handle`, 
                                        [title, salary, equity, company_handle])
        
        return newJob.rows[0]
    }











}



module.exports = Job

