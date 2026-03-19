require("dotenv").config();
const express = require('express');
const { pool } = require('./index.js');

const router = express.Router();

router.post("/signup", async (req, res) => {
    try {
        const { userName, email, password } = req.body;
        if (!userName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const query = `
            INSERT INTO users (username, email, password)
            VALUES ($1, $2, $3)
        `;

        const values = [userName, email, password];

        await pool.query(query, values);

        return res.status(201).json({
            message: "User registered successfully",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;