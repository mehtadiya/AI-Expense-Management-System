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

        if (categoryID === null) {

            const totalCheck = await pool.query(`
                SELECT 1
                FROM budget
                WHERE categoryid IS NULL
                AND $1 <= todate
                AND $2 >= fromdate
                AND userid = $3
            `, [fromDate, toDate, userID]);

            if (totalCheck.rows.length > 0) {
                return res.status(409).json({
                    message: "Total budget already exists for this date range"
                });
            }

            const sumResult = await pool.query(`
                SELECT COALESCE(SUM(amountlimit), 0) AS total
                FROM budget
                WHERE categoryid IS NOT NULL
                AND $1 <= todate
                AND $2 >= fromdate
                AND userid = $3
            `, [fromDate, toDate, userID]);

            const categorySum = parseFloat(sumResult.rows[0].total);

            if (categorySum > 0 && categorySum !== parseFloat(amountLimit)) {
                return res.status(400).json({
                    message: `Total budget must equal sum of category budgets (${categorySum})`
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
    const client = await pool.connect();

    try {
        const { fromDate, toDate, categoryAmount } = req.body;

        if (!fromDate || !toDate || !categoryAmount) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userID = req.user.userID;

        const totalResult = await client.query(`
            SELECT amountlimit
            FROM budget
            WHERE categoryid IS NULL
            AND $1 <= todate
            AND $2 >= fromdate
            AND userid = $3
        `, [fromDate, toDate, userID]);

        let totalBudget = null;

        if (totalResult.rows.length > 0) {
            totalBudget = parseFloat(totalResult.rows[0].amountlimit);
        }

        const sumResult = await client.query(`
            SELECT COALESCE(SUM(amountlimit), 0) AS total
            FROM budget
            WHERE categoryid IS NOT NULL
            AND $1 <= todate
            AND $2 >= fromdate
            AND userid = $3
        `, [fromDate, toDate, userID]);

        let currentSum = parseFloat(sumResult.rows[0].total);

        await client.query("BEGIN");

        for (const [categoryID, amountLimit] of Object.entries(categoryAmount)) {

            const amount = parseFloat(amountLimit);

            const duplicateCheck = await client.query(`
                SELECT 1
                FROM budget
                WHERE categoryid = $1
                AND $2 <= todate
                AND $3 >= fromdate
                AND userid = $4
            `, [categoryID, fromDate, toDate, userID]);

            if (duplicateCheck.rows.length > 0) {
                await client.query("ROLLBACK");
                return res.status(409).json({
                    message: `Budget already exists for category ${categoryID}`
                });
            }

            if (totalBudget !== null && currentSum + amount > totalBudget) {
                await client.query("ROLLBACK");
                return res.status(400).json({
                    message: `Category budgets exceed total budget (${totalBudget})`
                });
            }

            await client.query(`
                INSERT INTO budget (userid, fromdate, todate, categoryid, amountlimit)
                VALUES ($1, $2, $3, $4, $5)
            `, [userID, fromDate, toDate, categoryID, amount]);

            currentSum += amount;
        }

        if (totalBudget !== null && currentSum !== totalBudget) {

            const remaining = totalBudget - currentSum;

            await client.query("ROLLBACK");

            return res.status(400).json({
                message:
                    remaining > 0
                        ? `₹${remaining} budget is remaining to allocate`
                        : `Category budgets exceeded total budget by ₹${Math.abs(remaining)}`
            });
        }
        await client.query("COMMIT");

        res.status(201).json({
            message: "Category-wise budget added successfully"
        });

    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        res.status(500).json({ message: "Server error" });
    } finally {
        client.release();
    }
});


//get duration
router.get('/duration', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(`
          SELECT
            distinct
            fromdate AS "fromDate",
            todate AS "toDate"
          FROM budget
        `);
        res.json(result.rows);
    } catch (error) {
        console.log("error", error);
        res.status(500).send("cannot fetch duration");
    }
});

module.exports = router;