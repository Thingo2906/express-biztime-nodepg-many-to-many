const express = require("express");
const ExpressError = require("../expressError");
const slugify = require("slugify");
const router = express.Router();
const db = require("../db");


//GET /companies
//Returns list of companies, like {companies: [{code, name}, ...]}
router.get('/', async function (req, res, next){
    try{
        const result = await db.query(`SELECT * FROM companies`);
        return res.json({company : result.rows});

    }catch(e){
        return next(e);
    }
    
});
//GET /companies/[code]
// Return obj of company: {company: {code, name, description}}
// If the company given cannot be found, this should return a 404 status response.
// router.get('/:code', async function (req, res, next){
//     try{
//         const {code} = req.params
//         const result = await db.query(`SELECT * FROM companies WHERE code = $1`, [code])
//         if (result.rows.length === 0){
//             throw new ErrorExpress(" cannot find the company with this code", 404)
//         }else{
//             return res.json({company: result.rows[0]});
//         }
//     }catch(e){
//        return next(e);
//     }
// });

//GET /companies/[code]
//Return obj of company: {company: {code, name, description, invoices: [id, ...]}}

//If the company given cannot be found, this should return a 404 status response.
// router.get('/:code', async function(req, res, next){
//     try{
//         let code = req.params.code;
//         const compResult = await db.query(`SELECT code, name, description FROM companies WHERE code = $1`, [code]);
//         const invResult = await db.query(`SELECT id FROM invoices WHERE comp_code = $1`, [code]);
//         if (compResult.rows.length === 0){
//             throw new ExpressError("the company given cannot be found", 404);
//         }
//         const companies = compResult.rows[0];// is an object
//         const invoices = invResult.rows;// is an array
//         // invoice is assigned as a property of companies object.
//         companies.invoices = invoices.map(inv => inv.id );// use map to get an array of id
//         return res.json({company: companies});
//     }catch(e){
//         return next(e);
//     }
// });
router.get('/:code', async function(req, res, next){
    try{
        let {code} = req.params;
        const result = await db.query(`SELECT c.code, c.name, c.description, i.industry
                           FROM companies AS c LEFT JOIN companies_industries AS ci ON c.code = ci.company_code
                           LEFT JOIN industries AS i ON ci.industry_code = i.code WHERE c.code = $1`, [code]);
        console.log(result.rows[0]);
        const invResult = await db.query(`SELECT id FROM invoices WHERE comp_code = $1`, [code]);
        if (result.rows.length === 0){
            throw new ExpressError("the company cannot be found", 404);
        }
        const companies = result.rows[0];
        const invoices = invResult.rows;
        companies.invoices = invoices.map(inv => inv.id );
        return res.json({company: companies});
    }catch(e){
        return next(e);
    }
})
//POST /companies
//Adds a company.
//Needs to be given JSON like: {code, name, description}
//Returns obj of new company: {company: {code, name, description}}
// router.post('/', async function(req, res, next){
//     try{
//         const {code, name, description} = req.body;
//         const result = await db.query(`INSERT INTO companies (code, name, description) 
//                              VALUES ($1, $2, $3) RETURNING code, name, description`, [code, name, description]);
//         return res.status(201).json({company: result.rows[0]});
//     }catch(e){
//         return next(e);
//     }
// })

//Using slugify() for name to get code from it
// the code will lowercase with hyphen '-'between each word
router.post('/', async function(req, res, next){
    try{
        const {name, description} = req.body;
        const code = slugify(name, {lower: true});
        const result = await db.query(`INSERT INTO companies (code, name, description) 
                VALUES ($1, $2) RETURNING code, name, description`, [code, name, description]);
        return res.status(201).json({company: result.rows[0]});
    }catch(e){
        return next(e)
    };
})
//PUT /companies/[code]
//Edit existing company.
//Should return 404 if company cannot be found.
//Needs to be given JSON like: {name, description}
//Returns update company object: {company: {code, name, description}}
router.put('/:code', async function(req, res, next){
    try{
        const {code} = req.params;
        const {name, description} = req.body;
        const result = await db.query(`UPDATE companies SET name = $1, description = $2 WHERE code = $3 RETURNING code, name, description`, [name, description, code]);
        if (result.rows.length === 0){
            throw new ExpressError("the company cannot be found", 404);
        }else{
            return res.json({company: result.rows[0]})

        }
    }catch(e){
        return next(e);
    }
});
//DELETE /companies/[code]
//Deletes company.
//Should return 404 if company cannot be found.
//Returns {status: "deleted"}
router.delete('/:code', async function(req, res, next){
    try{
        const{code} = req.params;
        const result = await db.query(`DELETE FROM companies WHERE code = $1 RETURNING code`, [code]);
        if(result.rows.length === 0){
            throw new ExpressError("the company cannot be found", 404);
        }else{
            return res.send({status: "deleted"});
        }
    }catch(e){
        return next(e);
    }
});
module.exports = router;