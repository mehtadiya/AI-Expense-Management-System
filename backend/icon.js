const express = require('express');
const { pool } = require('./index.js');
const verifyToken = require('./middleware/verifyToken.js');
const router = express.Router();

require('dotenv').config();

// get all icons
router.get('/icons', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(`
          SELECT
            iconid AS "iconID",
            icon,
            color
          FROM icon
        `);
        res.json(result.rows);
    } catch (error) {
        console.log("error", error);
        res.status(500).send("error for fetching icons");
    }
});

module.exports = router;