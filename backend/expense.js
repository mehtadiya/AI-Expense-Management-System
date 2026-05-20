const express = require('express');
const { pool } = require('./index.js');
const verifyToken = require('./middleware/verifyToken.js');
const router = express.Router();

require('dotenv').config();

// EXPENSE DATA (GROUP)
router.get('/expenseData', verifyToken, async (req, res) => {
    try {
        const userID = req.user.userID;

        const result = await pool.query(`
            SELECT
              categoryid AS "categoryID",
              SUM(expenseamount) AS total,
              expensedate AS "expenseDate",
              expenseamount AS "expenseAmount"
            FROM expense
            WHERE userid = $1
            GROUP BY categoryid, expensedate, expenseamount
        `, [userID]);

        res.json(result.rows);

    } catch (error) {
        console.log("error", error);
        res.status(500).send("error fetching expense data");
    }
});

// RECENT 5 EXPENSES
router.get('/recentExpenses', verifyToken, async (req, res) => {
    try {
        const userID = req.user.userID;

        const result = await pool.query(`
            SELECT
              e.expenseid AS "expenseID",
              e.categoryid AS "categoryID",
              c.category,
              i.icon,
              i.color,
              e.userid AS "userID",
              e.note,
              e.expenseamount AS "expenseAmount",
              e.expensedate AS "expenseDate"
            FROM expense e
            JOIN category c ON e.categoryid = c.categoryid
            JOIN icon i ON c.iconid = i.iconid
            WHERE c.userid = $1
            ORDER BY e.expenseid DESC
            LIMIT 5
        `, [userID]);

        res.json(result.rows);
    } catch (error) {
        console.log("error", error);
        res.status(500).send("error for fetching recent expenses");
    }
});



// GET ALL EXPENSES (WITH FILTER)
router.get('/expenses', verifyToken, async (req, res) => {
    try {
        const { category } = req.query;
        const userID = req.user.userID;

        let query = `
            SELECT
              e.expenseid AS "expenseID",
              c.userid AS "userID",
              c.categoryid AS "categoryID",
              c.category,
              e.note,
              e.expenseamount AS "expenseAmount",
              e.expensedate AS "expenseDate",
              c.iconid AS "iconID",
              i.icon AS "icon"
            FROM expense e
            JOIN category c ON e.categoryid = c.categoryid
            JOIN icon i ON i.iconid= c.iconid
            WHERE e.userid = $1
        `;

        let values = [userID];

        if (category) {
            query += ` AND c.category = $2`;
            values.push(category);
        }

        const result = await pool.query(query, values);
        res.json(result.rows);

    } catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).send("Error fetching expenses");
    }
});



// ADD SINGLE EXPENSE
router.post('/expenses/add', verifyToken, async (req, res) => {
    try {
        const userID = req.user.userID;
        const { categoryID, note, expenseAmount, expenseDate } = req.body;

        await pool.query(`
            INSERT INTO expense (userid, categoryid, note, expenseamount, expensedate)
            VALUES ($1, $2, $3, $4, $5)
        `, [userID, categoryID, note, expenseAmount, expenseDate]);

        res.status(200).send({ message: "Expense added successfully" });

    } catch (error) {
        console.error("Error adding expense:", error);
        res.status(500).send({ message: "Error adding expense" });
    }
});

// ADD MULTIPLE EXPENSES
router.post("/expenses/add-multiple", verifyToken, async (req, res) => {
    try {
        const userID = req.user.userID;
        const { expenses } = req.body;

        for (const exp of expenses) {
            await pool.query(`
                INSERT INTO expense (userid, categoryid, note, expenseamount, expensedate)
                VALUES ($1, $2, $3, $4, $5)
            `, [userID, exp.categoryID, exp.note, exp.expenseAmount, exp.expenseDate]);
        }

        res.status(200).send({ message: "All expenses added successfully" });

    } catch (error) {
        console.error("Error adding multiple expenses:", error);
        res.status(500).send({ message: "Error adding expenses" });
    }
});

// DELETE EXPENSE
router.delete("/expenses/:expenseID", verifyToken, async (req, res) => {
    try {
        const { expenseID } = req.params;

        const result = await pool.query(
            "DELETE FROM expense WHERE expenseid = $1",
            [expenseID]
        );

        if (result.rowCount > 0) {
            res.status(200).json({ message: "Expense deleted successfully" });
        } else {
            res.status(404).json({ message: "Expense not found" });
        }

    } catch (error) {
        console.error("Error deleting expense:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// UPDATE EXPENSE
router.put("/expense/:expenseID", verifyToken, async (req, res) => {
    try {
        const { expenseID } = req.params;
        const { categoryID, note, expenseAmount, expenseDate } = req.body;

        const result = await pool.query(`
            UPDATE expense
            SET categoryid = $1,
                note = $2,
                expenseamount = $3,
                expensedate = $4
            WHERE expenseid = $5
        `, [categoryID, note, expenseAmount, expenseDate, expenseID]);

        if (result.rowCount > 0) {
            res.status(200).send({ message: "Expense updated successfully" });
        } else {
            res.status(404).send({ message: "Expense not found" });
        }

    } catch (error) {
        console.error("Error updating expense:", error);
        res.status(500).send({ message: "Server error while updating expense" });
    }
});

module.exports = router;