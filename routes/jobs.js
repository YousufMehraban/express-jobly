"use strict"

const express = require('express')
const router = new express.Router()

const jsonschema = require('jsonschema')
const jwt = require('jsonwebtoken')
const db = require('../db')
const { NotFoundError, BadRequestError } = require('../expressError')

const Job = require('../models/job')

const jobNewSchema = require('../schemas/jobNewSchema.json')




 // /post creating a new job
// check if job already exists throw error
 // {title: "engineering", salary: 150000, enquity = 0.0, company_handle: 'smith-llc'} => { job }

router.post('/', async function(req, res, next){
    try{
        const validator = jsonschema.validate(req.body, jobNewSchema)
        if(!validator.valid){
            const err = validator.errors.map((e)=> e.stack)
            throw new BadRequestError(err)
        }
        const newJob = await Job.create(req.body)
        return res.status(201).json({job: newJob})

    }catch(e){
        return next(e)
    }

})



// finding all jobs
// /get returning {jobs: [ {}, .... ] }

// /get can filters jobs by title, minSalary and hasEquity in query string.
// {title: "engineering", minSalary: 100000, hasEquity: true} =>,{jobs: [ {}, .... ] }

router.get('/', async function(req, res, next){
    try{
        const search = req.query
        console.log(search)
        if(search.title !== undefined){
            search.title = search.title;
        } 
        if(search.minSalary !== undefined){
            search.minSalary = +search.minSalary;
        }
        if(search.hasEquity === 'true'){
            search.hasEquity = true;
        }else{
            search.hasEquity = false;
        }
        const jobs = await Job.getAll(search)
        return res.json({jobs})

    }catch(e){
        return next(e)
    }
})

//  find a job by id
// /get/:id  returning {job:{...}}

router.get('/:id', async function(req, res, next){
    try{
        const job = await Job.get(req.params.id)
        if(!job) throw new NotFoundError()

        return res.json({job})

    }catch(e){
        return next(e)
    }
})










module.exports = router