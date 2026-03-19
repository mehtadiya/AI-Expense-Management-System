const express = require('express');
const { pool } = require('./index.js');
const verifyToken = require('./middleware/verifyToken.js');
const router = express.Router();

require('dotenv').config();

// ADD DURATION
router.post('/duration/add', async (req, res) => {
    try {
        const { fromDate, toDate } = req.body;

        const result = await pool.query(
            `INSERT INTO duration (fromdate, todate)
             VALUES ($1, $2)`,
            [fromDate, toDate]
        );

        if (result.rowCount > 0) {
            res.status(200).send({ message: "duration added successfully" });
        } else {
            res.status(400).send({ message: "duration not added" });
        }

    } catch (error) {
        console.error("Error adding duration:", error);
        res.status(500).send({ message: "Server error while adding duration" });
    }
});

// GET DURATION
router.get('/duration', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(`
          SELECT
            durationid AS "durationID",
            fromdate AS "fromDate",
            todate AS "toDate"
          FROM duration
          ORDER BY durationid DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.log("error", error);
        res.status(500).send("cannot fetch duration");
    }
});

module.exports = router;