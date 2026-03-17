require("dotenv").config();
const express = require('express');
const { sql, poolPromise } = require('./index.js');
const router = express.Router();
const jwt = require("jsonwebtoken");
const verifyToken=require("./middleware/verifyToken.js")
const JWT_SECRET = process.env.JWT_SECRET;


router.get('/users',verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("select * from users");
    res.send(result.recordset);
  }
  catch (error) {
    console.log("error:", error);
    res.send("error for fetching user table");
  }
})

router.post("/users/login", async (req, res) => {
  try {
    const pool = await poolPromise;
    const { email, password } = req.body;

    const result = await pool
      .request()
      .input("email", sql.VarChar, email)
      .input("password", sql.VarChar, password)
      .query("SELECT * FROM users WHERE email=@email AND password=@password");
    
    if (result.recordset.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });

    }

    const user = result.recordset[0];

    const token = jwt.sign({
      userID: user.userID,
      userName: user.userName,
      email: user.email,
    },
      JWT_SECRET,
      { expiresIn: "1h" }
    )

    res.json({
      token,
      user
    })

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


//get specific details from userID

router.get('/usersByID',verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const  userID  = req.user.userID;
    const result = await pool.request()
      .input("userID", sql.Int, userID)
      .query("select * from users where userID=@userID");
    res.send(result.recordset);
  }
  catch (error) {
    console.log("error:", error);
    res.send("error for fetching user table");
  }
})

router.put('/users/edit',verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const  userID  = req.user.userID;
    const { userName, email } = req.body;
    const result = await pool.request()
      .input("userID", sql.Int, userID)
      .input("userName", sql.VarChar(50), userName)
      .input("email", sql.VarChar(50), email)
      .query(`update users set userName=@userName , email=@email where userID=@userID `)
    if (result.rowsAffected > 0) {
      res.status(200).send({ message: "user updated successfully" });
    } else {
      res.status(404).send({ message: "user not found" });
    }
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).send({ message: "Server error while updating expense" });
  }

})

//change password
router.put('/changePassword',verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const  userID  = req.user.userID;
    const { password, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      return res.status(400).send({ message: "New password and confirm password do not match" });
    }
    const result = await pool.request()
      .input("userID", sql.Int, userID)
      .input("password", sql.VarChar(50), password)
      .input("newPassword", sql.VarChar(50), newPassword)
      .query(`update users set password=@newPassword where userID=@userID  and password=@password`)
    if (result.rowsAffected > 0) {
      res.status(200).send({ message: "password changed successfully" });
    } else {
      res.status(404).send({ message: "password can not be changes" });
    }
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).send({ message: "Server error while updating expense" });
  }

})

module.exports = router