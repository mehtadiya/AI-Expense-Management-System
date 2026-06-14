const express = require('express');
const { pool } = require('./index.js');
const verifyToken = require('./middleware/verifyToken.js');
const router = express.Router();

require('dotenv').config();

// GET USER CATEGORIES
router.get('/categories', verifyToken, async (req, res) => {
    try {
        const userID = req.user.userID;

        const result = await pool.query(`
            SELECT
              c.categoryid AS "categoryID",
              c.category,
              c.userid AS "userID",
              c.iconid AS "iconID",
              i.icon,
              i.color
            FROM category c
            JOIN icon i ON c.iconid = i.iconid
            WHERE c.userid = $1
        `, [userID]);

        res.json(result.rows);

    } catch (error) {
        console.log("error:", error);
        res.status(500).send("error in fetching category table");
    }
});


// GET CATEGORY + BUDGET
router.get('/categoriesBudgets', verifyToken, async (req, res) => {
    try {
        const userID = req.user.userID;

        const result = await pool.query(`
            SELECT
                c.categoryid AS "categoryID",
                c.category,
                c.userid AS "userID",
                c.iconid AS "iconID",
                i.icon,
                i.color,

                b.amountlimit AS "amountLimit",
                b.fromdate AS "fromDate",
                b.todate AS "toDate"

            FROM category c

            JOIN icon i
                ON c.iconid = i.iconid

            LEFT JOIN budget b
                ON c.categoryid = b.categoryid

            WHERE c.userid = $1

            UNION

            SELECT
                NULL AS "categoryID",
                'Total Budget' AS category,
                NULL AS "userID",
                NULL AS "iconID",
                NULL AS icon,
                NULL AS color,

                b.amountlimit AS "amountLimit",
                b.fromdate AS "fromDate",
                b.todate AS "toDate"

            FROM budget b

            WHERE b.userid = $1
              AND b.categoryid IS NULL

        `, [userID]);

        res.json(result.rows);

    } catch (error) {
        console.log("error:", error);
        res.status(500).send("error in fetching category and budget details");
    }
});



// DELETE CATEGORY (WITH EXPENSE)
router.delete("/categories/:categoryID", verifyToken, async (req, res) => {
    try {
        const { categoryID } = req.params;
        const userID = req.user.userID;

        // Run both deletes safely
        await pool.query("DELETE FROM expense WHERE categoryid = $1 AND userid = $2", [categoryID, userID]);
        await pool.query("DELETE FROM category WHERE categoryid = $1 AND userid = $2", [categoryID, userID]);

        res.status(200).json({ message: "Category deleted successfully" });

    } catch (err) {
        console.error("Error deleting category:", err);
        res.status(500).send("Server error while deleting category");
    }
});

// UPDATE CATEGORY
router.put("/categories/:categoryID", verifyToken, async (req, res) => {
    try {
        const { categoryID } = req.params;
        const { category, iconID } = req.body;

        const result = await pool.query(`
            UPDATE category
            SET iconid = $1,
                category = $2
            WHERE categoryid = $3
        `, [iconID, category, categoryID]);

        if (result.rowCount > 0) {
            res.status(200).send({ message: "category updated successfully" });
        } else {
            res.status(404).send({ message: "category not found" });
        }

    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).send({ message: "Server error while updating category" });
    }
});

// ADD CATEGORY
router.post("/categories/add", verifyToken, async (req, res) => {
    try {
        const userID = req.user.userID;
        
        const { category, iconID } = req.body;
        const result = await pool.query(`
            INSERT INTO category (category, userid, iconid)
            VALUES ($1, $2, $3)
        `, [category, userID, iconID]);

        if (result.rowCount > 0) {
            res.status(200).send({ message: "Category added successfully" });
        } else {
            res.status(400).send({ message: "Category not added" });
        }

    } catch (error) {
        console.error("Error adding category:", error);
        res.status(500).send({ message: "Server error while adding category" });
    }
});

module.exports = router;