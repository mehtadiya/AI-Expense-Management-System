const {sql,poolPromise} =require('./index.js');
const express= require('express');
const verifyToken = require('./middleware/verifyToken.js');
const router=express.Router();

require('dotenv').config();

//return details of category of specific user
router.get('/categories',verifyToken,async(req,res)=>{
    try{
        const pool=await poolPromise;
        const userID=  req.user.userID;
        const result= await pool.request()
        .input('userID',userID)
        .query("select c.categoryID,c.category,c.userID,c.iconID,i.icon,i.color from category c join icon i on c.iconID=i.iconID  where userID=@userID");
        res.send(result.recordset);
    }
    catch(error){
        console.log("error:",error);
        res.send("error in fetching category table");
    }
})

//return category and budget details
router.get('/categoriesBudgets',verifyToken,async(req,res)=>{
    try{
        const pool=await poolPromise;
        const userID=  req.user.userID;
        const result= await pool.request()
        .input('userID',userID)
        .query("select c.categoryID,c.category,c.userID,c.iconID,i.icon,i.color, b.amountLimit,b.fromDate,b.toDate from category c join icon i on c.iconID=i.iconID  join budget b on c.categoryID=b.categoryID where c.userID=@userID");
        res.send(result.recordset);
    }
    catch(error){
        console.log("error:",error);
        res.send("error in fetching category and budget details");
    }
})
//delete category from that specific user
router.delete("/categories/:categoryID",verifyToken, async (req, res) => {
  const { categoryID } = req.params;
  const  userID = req.user.userID;
  const pool= await poolPromise;
  try {
    await pool
      .request()
      .input("categoryID", sql.Int, categoryID)
      .input("userID", sql.Int, userID)
      .query(`
        DELETE FROM Expense WHERE categoryID=@categoryID AND userID=@userID;
        DELETE FROM Category WHERE categoryID=@categoryID AND userID=@userID;
      `);

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).send("Server error while deleting category");
  }
});


router.put("/categories/:categoryID",verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const { categoryID } = req.params;
    const { category,iconID } = req.body;

    const result = await pool.request()
      .input("categoryID", sql.Int, categoryID)
      .input("iconID", sql.Int, iconID)
      .input("category", sql.VarChar(50), category)
      .query(`
        UPDATE category 
        SET iconID = @iconID,
            category = @category
        WHERE categoryID = @categoryID
      `);

    if (result.rowsAffected[0] > 0) {
      res.status(200).send({ message: "category updated successfully" });
    } else {
      res.status(404).send({ message: "category not found" });
    }
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).send({ message: "Server error while updating category" });
  }
});

router.post("/categories/add", verifyToken,async (req, res) => {
  try {
    const pool = await poolPromise;
    const userID = req.user.userID;
    const { category, iconID } = req.body;

    const result = await pool.request()  
      .input("category", sql.VarChar(50), category)
      .input("userID", sql.Int, userID)
      .input("iconID", sql.Int, iconID)
      .query(`
        INSERT INTO category (category, userID, iconID)
        VALUES (@category, @userID, @iconID)
      `);

    

    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      res.status(200).send({ message: "Category added successfully" });
    } else {
      res.status(400).send({ message: "Category not added" });
    }
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).send({ message: "Server error while adding category" });
  }
});



module.exports=router;