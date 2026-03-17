const express = require('express');
const { sql, poolPromise } = require('./index.js');
const verifyToken = require('./middleware/verifyToken.js');
const router = express.Router()
require('dotenv').config()


//fetch categories having budget
router.get('/budgets',verifyToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        const  userID  = req.user.userID;
        const result = await pool.request()
            .input('userID', sql.Int, userID)
            .query("select c.categoryID,c.category,b.budgetID,b.userID,i.iconID,i.icon,i.color,b.amountLimit,b.durationID from category c join budget b on c.categoryID=b.categoryID join icon i on c.iconID=i.iconID where b.userID=@userID")
        res.send(result.recordset);
    } catch (error) {
        console.log("error", error);
        res.send("error in fetching categories having budget")
    }
})

//to fetch total expense done by user 
router.get('/budgets/totalExpense/:userID', async (req, res) => {
    try {
        const pool = await poolPromise;
        const { userID } = req.params;
        const result = await pool.request()
            .input('userID', sql.Int, userID)
            .query("select categoryID,sum(expenseAmount) as total from expense where userID=@userID group by categoryID ")
        res.send(result.recordset)
    } catch (error) {
        console.log("error", error);
        res.send("error in fetching categories having budget")
    }
})

//to add Totalbudget 
router.post("/budgets/add", verifyToken, async (req, res) => {
    try {
        const { fromDate, toDate, categoryID, amountLimit } = req.body;

        if (!fromDate || !toDate || !amountLimit) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const pool = await poolPromise;
        const userID = req.user.userID;
        if (categoryID === null) {
            const overlapCheck = await pool.request()
                .input("userID", sql.Int, userID)
                .input("fromDate", sql.Date, fromDate)
                .input("toDate", sql.Date, toDate)
                .query(`
                    SELECT 1
                    FROM Budget
                    WHERE categoryID IS NULL
                    AND @fromDate <= toDate
                    AND @toDate >= fromDate
                    AND userID=@userID
                `);

            if (overlapCheck.recordset.length > 0) {
                return res.status(409).json({
                    message: "Total budget already exists for this date range"
                });
            }
        }

        await pool.request()
            .input("userID", sql.Int, userID)
            .input("fromDate", sql.Date, fromDate)
            .input("toDate", sql.Date, toDate)
            .input("categoryID", sql.Int, categoryID)
            .input("amountLimit", sql.Decimal(10, 2), amountLimit)
            .query(`
                INSERT INTO Budget (userID,fromDate, toDate, categoryID, amountLimit)
                VALUES (@userID,@fromDate, @toDate, @categoryID, @amountLimit)
            `);

        res.status(201).json({ message: "Budget added successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

//to add Category wise budget
router.post("/budgets/addCategoryWise", verifyToken, async (req, res) => {
    try {
        const { fromDate, toDate, categoryAmount } = req.body;
        if (!fromDate || !toDate) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const pool = await poolPromise;
        const userID = req.user.userID;

        for (const [categoryID, amountLimit] of Object.entries(categoryAmount)) {
            await pool.request()
                .input("userID", sql.Int, userID)
                .input("fromDate", sql.Date, fromDate)
                .input("toDate", sql.Date, toDate)
                .input("categoryID", sql.Int, categoryID)
                .input("amountLimit", sql.Decimal(10, 2), amountLimit)
                .query(`
                INSERT INTO Budget (userID,fromDate, toDate, categoryID, amountLimit)
                VALUES (@userID,@fromDate, @toDate, @categoryID, @amountLimit)
              `);
        }



        res.status(201).json({ message: "Budget added successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router