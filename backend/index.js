const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const { Pool } = require('pg'); // provide postgreSQL support
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const poolPromise = pool.connect()
    .then(client => {
        console.log("connected to PostgreSQL (live)");
        client.release();//Releases connection back to pool.
        return pool;
    })
    .catch(err => {
        console.log("db connection failed");
        console.log(err);
        throw err;
    });

module.exports = { pool, poolPromise };