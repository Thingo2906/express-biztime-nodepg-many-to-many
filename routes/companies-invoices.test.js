process.env.NODE_ENV === "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");
let testComp;
let testInv ;
beforeEach(async function(){
    const compResult = await db.query(`INSERT INTO companies (code, name, description) VALUES ('microsoft', 'Microsoft computer', 'maker of technology') RETURNING code, name, description`);
    const invResult = await db.query(`INSERT INTO invoices (comp_Code, amt, paid, add_date, paid_date) VALUES ('microsoft', 200, false, 'now', null) RETURNING id, comp_code, amt, paid, add_date, paid_date`);
    

    testComp = compResult.rows[0];
    testInv = invResult.rows[0];  
    testInv.add_date = testInv.add_date.toISOString();
  
});
afterEach(async function(){
    await db.query(`DELETE FROM companies`);
    await db.query(`DELETE FROM invoices`);
});
afterAll(async function(){
    await db.end()
});
// test for the route that return all companies
describe('GET/companies', function(){
    test('get the list of companies', async () => {
        const res = await request(app).get('/companies');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({company: [testComp]});
        
    });
});
//test for specific company with its code
describe('GET/companies/:code', function(){
    test('get the exist company by its code', async () =>{
        testComp.invoices = [testInv.id];
        console.log({company: testComp});
        const res = await request(app).get(`/companies/${testComp.code}`);
        console.log(res.body);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({company: testComp})
    });
    test('respond 404 for invalid code', async () =>{
        const res = await request(app).get(`/companies/fhaydg`);
        expect(res.statusCode).toBe(404);
    })
});
// test for adding new company
describe('POST/companies', function(){
    test('adding a new company', async () => {
        const res = await request(app).post('/companies').send({code: "google", name: "Google company", description: "maker of computer"});
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({company: {code: "google", name: "Google company", description: "maker of computer"}});
    });
});
//test for update a secific company
describe('PATCH/companies/:code', function(){
    test('update a exist company', async () => {
        const res = await request(app).put(`/companies/${testComp.code}`).send({name: "Google company", description: "maker of computer"});
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({company: {code: testComp.code, name: "Google company", description: "maker of computer" }});
    
    });
    test('respond 404 for invalid code', async () =>{
        const res = await request(app).put(`/companies/asdvhd`).send({name: "Google company", description: "maker of computer"});
        expect(res.statusCode).toBe(404);
    })
});
//test for delete a company
describe('DELETE/companies/:code', function(){
    test('delete a copmpany', async () => {
        const res = await request(app).delete(`/companies/${testComp.code}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({status: "deleted"});
    });
    test('respond 404 for invalid code', async () =>{
        const res = await request(app).delete(`/companies/hsgdjd`);
        expect(res.statusCode).toBe(404);
    })
});
//###############################################
//TEST FOR INVOICES

// test for the route that return all invoices
describe('GET/invoices', function(){
    test('get the list of invoices', async () => {
        const res = await request(app).get('/invoices');
        console.log(res.body);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({invoices: [testInv]});
        
    });
});
//test for specific invoice with its id
describe('GET/invoices/:id', function(){
    test('get the exist company by its code', async () =>{
        const res = await request(app).get(`/invoices/${testInv.id}`);
        //console.log(res.body);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({invoice: testInv})
    });
    test('respond 404 for invalid code', async () =>{
        const res = await request(app).get(`/invoices/576`);
        expect(res.statusCode).toBe(404);
    })
});
// test for adding new company
describe('POST/invoices', function(){
    test('adding a new invoice', async () => {
        const res = await request(app).post('/invoices').send({comp_code: 'microsoft', amt: 600});
        //console.log(testInv);
        //console.log(res.body);
        expect(res.statusCode).toBe(201);
        //we get default value for paid, add_paid, and paid_date
        // the comp_code need to be "microsoft", because it need to match with code in companies table
        // we have a second microsoft, so id has to increase 1.
        expect(res.body).toEqual({invoice: {id: testInv.id + 1, comp_code: 'microsoft', amt: 600, paid: testInv.paid, add_date: testInv.add_date, paid_date: testInv.paid_date}});
    });
});
//test for update a secific invoice
describe('PUT/invoices/:id', function(){
    test('update a exist invoice', async () => {
        
        const res = await request(app).put(`/invoices/${testInv.id}`).send({amt: 350});
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({invoice: {id: testInv.id, comp_code: testInv.comp_code, amt: 350, paid: testInv.paid, add_date: testInv.add_date, paid_date: testInv.paid_date}});
    
    });
    test('respond 404 for invalid code', async () =>{
        const res = await request(app).put(`/invoices/453`).send({amt: 350});
        expect(res.statusCode).toBe(404);
    })
});
//test for delete a invoice
describe('DELETE/invoices/:id', function(){
    test('delete a invoice', async () => {
        const res = await request(app).delete(`/invoices/${testInv.id}`);
        console.log(res.body);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({status: "deleted"});
    });
    test('respond 404 for invalid id', async () =>{
        const res = await request(app).delete(`/invoices/345`);
        expect(res.statusCode).toBe(404);
    })
});



