const express = require("express");
const ExpressError = require("../expressError");
//const slugify = require("slugify");
const router = express.Router();
const db = require("../db");

//list all industries
router.get('/', async function(req, res, next){
    try{
        //array_agg(ci.company_code) is a function in SQL that aggregates values into an array.
        const result = await db.query(`SELECT i.code, i.industry, array_agg(ci.company_code) AS companies
                                   FROM industries i LEFT JOIN companies_industries ci
                                   ON i.code = ci.industry_code
                                   GROUP BY i.code, i.industry`);

        return res.json({industries: result.rows});

    }catch(e){
        return next(e);
    }
});

//add a new industry
router.post('/', async function(req, res, next){
    try{
        const {code, industry} = req.body;
        const result = await db.query(`INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry`, [code, industry]);
        return res.json({industry: result.rows[0]});
    }catch(e){
        return next(e);
    }
})
module.exports = router;