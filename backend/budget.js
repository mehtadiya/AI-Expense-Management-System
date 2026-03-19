const express = require('express');
const { pool } = require('./index.js');
const verifyToken = require('./middleware/verifyToken.js');
const router = express.Router();

require('dotenv').config();

// GET CATEGORIES HAVING BUDGET
router.get('/budgets', verifyToken, async (req, res) => {
    try {
        const userID = req.user.userID;

        const result = await pool.query(`
            SELECT
              c.categoryid AS "categoryID",
              c.category,
              b.budgetid AS "budgetID",
              b.userid AS "userID",
              i.iconid AS "iconID",
              i.icon,
              i.color,
              b.amountlimit AS "amountLimit",
              b.fromdate AS "fromDate",
              b.todate AS "toDate"
            FROM category c
            JOIN budget b ON c.categoryid = b.categoryid
            JOIN icon i ON c.iconid = i.iconid
            WHERE b.userid = $1
        `, [userID]);

        res.json(result.rows);

    } catch (error) {
        console.log("error", error);
        res.status(500).send("error in fetching categories having budget");
    }
});

// TOTAL EXPENSE PER CATEGORY
router.get('/budgets/totalExpense/:userID', async (req, res) => {
    try {
        const { userID } = req.params;

        const result = await pool.query(`
            SELECT categoryid AS "categoryID", SUM(expenseamount) AS total
            FROM expense
            WHERE userid = $1
            GROUP BY categoryid
        `, [userID]);

        res.json(result.rows);

    } catch (error) {
        console.log("error", error);
        res.status(500).send("error fetching total expense");
    }
});

// ADD TOTAL BUDGET
router.post("/budgets/add", verifyToken, async (req, res) => {
    try {
        const { fromDate, toDate, categoryID, amountLimit } = req.body;

        if (!fromDate || !toDate || !amountLimit) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userID = req.user.userID;

        // CHECK OVERLAP (TOTAL BUDGET)
        if (categoryID === null) {
            const overlapCheck = await pool.query(`
                SELECT 1
                FROM budget
                WHERE categoryid IS NULL
                AND $1 <= todate
                AND $2 >= fromdate
                AND userid = $3
            `, [fromDate, toDate, userID]);

            if (overlapCheck.rows.length > 0) {
                return res.status(409).json({
                    message: "Total budget already exists for this date range"
                });
            }
        }

        await pool.query(`
            INSERT INTO budget (userid, fromdate, todate, categoryid, amountlimit)
            VALUES ($1, $2, $3, $4, $5)
        `, [userID, fromDate, toDate, categoryID, amountLimit]);

        res.status(201).json({ message: "Budget added successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// ADD CATEGORY-WISE BUDGET
router.post("/budgets/addCategoryWise", verifyToken, async (req, res) => {
    try {
        const { fromDate, toDate, categoryAmount } = req.body;

        if (!fromDate || !toDate) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userID = req.user.userID;

        for (const [categoryID, amountLimit] of Object.entries(categoryAmount)) {
            await pool.query(`
                INSERT INTO budget (userid, fromdate, todate, categoryid, amountlimit)
                VALUES ($1, $2, $3, $4, $5)
            `, [userID, fromDate, toDate, categoryID, amountLimit]);
        }

        res.status(201).json({ message: "Budget added successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;