require("dotenv").config();
const express = require('express');
const { sql, poolPromise } = require('./index.js');
const router = express.Router();

router.post("/signup", async (req, res) => {
    try {
        const pool = await poolPromise;
        const { userName, email, password, userImage } = req.body;
        if (!userName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        

        const result = await pool.request()
            .input("userName", sql.VarChar(50), userName)
            .input("email", sql.VarChar(50), email)
            .input("password", sql.VarChar(50), password)
            .input("userImage", sql.VarChar(50), userImage)
            .query(`Insert into users (userName,email,password,userImage) values
            (@userName,@email,@password,@userImage)`)

        return res.status(201).json({
            message: "User registered successfully",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error" });
    }
})

module.exports=router