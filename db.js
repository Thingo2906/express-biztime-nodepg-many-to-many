/** Database setup for BizTime. */
const { Client } = require("pg");
const config = require('./config');

let DB_URI;

// If we're running in test "mode", use our test db
// Make sure to create both databases!
if (process.env.NODE_ENV === "test") {
  DB_URI = config.DB_URI1;
} else {
  DB_URI = config.DB_URI2;
}

let db = new Client({
  connectionString: DB_URI,
  // database: process.env.NODE_ENV === 'test' ? 'biztime_test' : 'biztime',
  // user: "suong",
  // password: "123456789",
  // host: "localhost",
  // port: 5432
});

db.connect();
module.exports = db;