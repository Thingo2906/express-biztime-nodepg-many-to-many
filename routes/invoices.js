const express = require('express');
const ErrorExpress = require ('../expressError');
const router = express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

//GET /invoices
//Return info on invoices: like {invoices: [{id, comp_code}, ...]}
router.get('/', async function(req, res, next){
    try{
        const result = await db.query(`SELECT * FROM invoices`);
        return res.json({invoices: result.rows});
    }catch(e){
        return next(e);
    }   
});

//GET /invoices/[id]
//Returns obj on given invoice.
//If invoice cannot be found, returns 404.
//Returns {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}}
router.get('/:id', async function(req, res, next){
    try{
        const {id} = req.params;
        const result = await db.query(`SELECT * FROM invoices WHERE id = $1`, [id]);
        if (result.rows.length === 0){
            throw new ErrorExpress("invoice cannot be found", 404);
        }else{
            return res.json({invoice: result.rows[0]});
        }
    }catch(e){
        return next(e);
    }
});
//POST /invoices
//Adds an invoice.
//Needs to be passed in JSON body of: {comp_code, amt}
//Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
router.post('/', async function(req, res, next){
    try{
        const {comp_code, amt} = req.body;
        const result = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt]);
        return res.status(201).json({invoice: result.rows[0]});
    }catch(e){
        return next(e);
    }
});
//PUT /invoices/[id]
//Updates an invoice.
//If invoice cannot be found, returns a 404.
//Needs to be passed in a JSON body of {amt}
//Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}
// router.put('/:id', async function(req, res, next){
//     try{
//         const {id} = req.params;
//         const {amt} = req.body;
//         const result = await db.query(`UPDATE invoices SET amt = $1 WHERE id = $2 RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, id]);
//         if (result.rows.length === 0){
//             throw new ExpressError("invoice cannot be found", 404);
//         }else{
//             return res.json({invoice: result.rows[0]});
//         }
//     }catch(e){
//         return next(e);
//     }
// });

// Futher study
router.put('/:id', async function(req, res, next){
    try{
        const {id} = req.params;
        const {amt, paid} = req.body;
        let paid_date = null;
        const currResult = await db.query(`SELECT * FROM invoices WHERE id = $1`, [id]);                     
        if (result.rows.length === 0){
            throw new ExpressError("invoice cannot be found", 404);
        }
        const currPaidDate = currResult.rows[0].paid_date;
        
        // This if statement will check for invoice is being paid, unpaid and paid.
        // check if paid_date is falthy?( null, NaN, EMTY, 0, false)
        //and paid is truthy
        if (!currPaidDate && paid){// just paid
            paid_date = new Date();
        }else if (!paid){// not paid
            paid_date = null;
        }else{
            paid_date = currPaidDate;// paid
        }
        const result = await db.query(`UPDATE INVOICES SET amt = $1, paid = $2, paid_date = $3 
                                  WHERE id = $4 RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, paid, paid_date, id]);
        return res.json({invoice: result.rows[0]});                         
    }catch(e){
        return next(e)
    }
});
//DELETE /invoices/[id]
//Deletes an invoice.

//If invoice cannot be found, returns a 404.

//Returns: {status: "deleted"}
router.delete('/:id', async function(req, res, next){
    try{
        const {id}= req.params;
        const result = await db.query(`DELETE FROM invoices WHERE id = $1 RETURNING id`, [id]);
        if (result.rows.length === 0){
            throw new ExpressError("invoice cannot be found", 404);
        }else{
            return res.json({status: "deleted"});
        }
        
    }catch(e){
        return next(e);
    }
});

module.exports = router;
