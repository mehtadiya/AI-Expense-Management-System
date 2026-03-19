// const sql=require('mssql');
// require("dotenv").config();


// var confing={
//     user: process.env.DB_USER, 
//     password: process.env.DB_PASSWORD,
//     server: process.env.DB_SERVER,
//     database: process.env.DB_DATABASE,
//     port:parseInt(process.env.DB_PORT),
//     options: {
//         trustServerCertificate: true,
//         trustedConnection:false,
//         enableArithAbort:true
//     }

// }

// const poolPromise= new sql.ConnectionPool(confing)
// .connect()
// .then(pool=>{
//     console.log("connected to db");
//     return pool;
// })
// .catch(err=>{
//     console.log("db connection failed");
//     throw err;
// })

// module.exports={sql,poolPromise}


const { Pool } = require('pg');
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
        client.release();
        return pool;
    })
    .catch(err => {
        console.log("db connection failed");
        throw err;
    });

module.exports = { pool, poolPromise };