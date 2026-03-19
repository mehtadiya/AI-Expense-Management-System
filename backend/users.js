require("dotenv").config();
const express = require('express');
const { pool } = require('./index.js');
const router = express.Router();
const jwt = require("jsonwebtoken");
const verifyToken = require("./middleware/verifyToken.js");

const JWT_SECRET = process.env.JWT_SECRET;

// GET ALL USERS
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        userid AS "userID",
        username AS "userName",
        email
      FROM users
    `);
    res.json(result.rows);
  } catch (error) {
    console.log("error:", error);
    res.status(500).send("error for fetching user table");
  }
});

// LOGIN
router.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const query = `
      SELECT userid, username, email
      FROM users
      WHERE email = $1 AND password = $2
    `;

    const result = await pool.query(query, [email, password]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];

    const token = jwt.sign(
      {
        userID: user.userid,
        userName: user.username,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        userID: user.userid,
        userName: user.username,
        email: user.email
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET USER BY ID (FROM TOKEN)
router.get('/usersByID', verifyToken, async (req, res) => {
  try {
    const userID = req.user.userID;

    const result = await pool.query(
      `
        SELECT
          userid AS "userID",
          username AS "userName",
          email
        FROM users
        WHERE userid = $1
      `,
      [userID]
    );

    res.json(result.rows);

  } catch (error) {
    console.log("error:", error);
    res.status(500).send("error for fetching user");
  }
});

// UPDATE USER
router.put('/users/edit', verifyToken, async (req, res) => {
  try {
    const userID = req.user.userID;
    const { userName, email } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET username = $1, email = $2 
       WHERE userid = $3`,
      [userName, email, userID]
    );

    if (result.rowCount > 0) {
      res.status(200).send({ message: "user updated successfully" });
    } else {
      res.status(404).send({ message: "user not found" });
    }

  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send({ message: "Server error while updating user" });
  }
});

// CHANGE PASSWORD
router.put('/changePassword', verifyToken, async (req, res) => {
  try {
    const userID = req.user.userID;
    const { password, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).send({ message: "Passwords do not match" });
    }

    const result = await pool.query(
      `UPDATE users 
       SET password = $1 
       WHERE userid = $2 AND password = $3`,
      [newPassword, userID, password]
    );

    if (result.rowCount > 0) {
      res.status(200).send({ message: "password changed successfully" });
    } else {
      res.status(400).send({ message: "Invalid current password" });
    }

  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).send({ message: "Server error while updating password" });
  }
});

module.exports = router;