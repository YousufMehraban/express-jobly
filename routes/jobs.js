"use strict"

const express = require('express')
const router = new express.Router()

const jsonschema = require('jsonschema')
const { NotFoundError, BadRequestError } = require('../expressError')

const Job = require('../models/job')

const jobNewSchema = require('../schemas/jobNewSchema.json')
const jobUpdateSchema = require('../schemas/jobUpdateSchema.json')

const { ensureIsAdmin } = require('../middleware/auth')


 // /post creating a new job
// check if job already exists throw error
 // {title: "engineering", salary: 150000, enquity = 0.0, company_handle: 'smith-llc'} => { job }

router.post('/', ensureIsAdmin, async function(req, res, next){
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

        if(search.title !== undefined){
            search.title = search.title;
        } 
        if(search.minSalary !== undefined){
            search.minSalary = +search.minSalary;
        }
        if(search.hasEquity === 'true'){
            search.hasEquity = true;
        }
        if (search.hasEquity == 'false'){
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
        if(!job) throw new NotFoundError('Job not Found')

        return res.json({job})

    }catch(e){
        return next(e)
    }
})


// /patch/:id updating an existing job
// returning the updated job
// {title, salary, equity} => {id, salary, equity, company_handle}

router.patch('/:id', ensureIsAdmin, async function(req, res, next){
    try{
        const data = req.body
        const validator = jsonschema.validate(data, jobUpdateSchema)
        if (!validator.valid){
            const err = validator.errors.map(e => e.stack)
            throw new BadRequestError(err)
        } 
        
        // const queryLine = {...data, ...req.params}
        const job = await Job.update(req.params.id, req.body)
        return res.json({job})

    }catch(e){
        return next(e)
    }
})


// /delete/id removing an existing job from db
// returing the job id

router.delete('/:id', ensureIsAdmin, async function(req, res, next){
    try{
        await Job.remove(req.params.id)
        return res.json({deleted: req.params.id})
    }catch(e){
        return next(e)
    }
})





module.exports = router