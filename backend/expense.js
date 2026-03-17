const express=require('express');
const {sql, poolPromise} = require('./index.js');
const verifyToken = require('./middleware/verifyToken.js');
const router=express.Router();

require('dotenv').config();

//to fetch recent 5 expenses in dashboard 
router.get('/recentExpenses',verifyToken,async(req,res)=>{
    try{
         const pool= await poolPromise;
         const userID= req.user.userID;
        const result=await pool.request()
        .input('userID', userID)
        .query("select top 5 expenseID,e.categoryID,c.category,i.icon,i.color,e.userID,note, expenseAmount,expenseDate from expense e join category c on e.categoryID=c.categoryID join icon i on c.iconID=i.iconID where c.userID=@userID order by expenseID desc");
        res.send(result.recordset);
    }catch(error){
        console.log("error",error);
        res.send("error for fetching recent expenses")
    }
   
})

//to fetch all the expenses for expense
router.get('/expenses',verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const { category } = req.query;
    const  userID  = req.user.userID;
    const request = pool.request();
    request.input("userID", sql.Int, userID);

    let query = ` 
      SELECT expenseID,c.userID , c.categoryID,c.category,e.note,e.expenseAmount,e.expenseDate,c.iconID 
      FROM expense e 
      JOIN category c ON e.categoryID = c.categoryID
      WHERE e.userID = @userID
    `;

    if (category) {
      query += ` AND c.category = @category`;
      request.input("category", sql.VarChar(50), category);
    }

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).send("Error fetching expenses");
  }
});

//
router.get('/expenseData',verifyToken,async(req,res)=>{
    try{
         const pool= await poolPromise;
         const userID= req.user.userID;
        const result=await pool.request()
        .input('userID', userID)
        .query("select categoryID,sum(expenseAmount) as total,expenseDate,expenseAmount from expense where userID=@userID group by categoryID ,expenseDate,expenseAmount ");
        res.send(result.recordset);
    }catch(error){
        console.log("error",error);
        res.send("error for fetching recent expenses")
    }
   
})

//add single data
router.post('/expenses/add',verifyToken,async(req,res)=>{
    try{
const pool=await poolPromise;
const  userID  = req.user.userID;
    const {categoryID,note,expenseAmount,expenseDate}=req.body;
    await pool.request()
     .input("userID", userID)
      .input("categoryID", categoryID)
      .input("note", note)
      .input("expenseAmount", expenseAmount)
      .input("expenseDate", expenseDate)
      .query(`
        INSERT INTO expense (userID, categoryID, note, expenseAmount, expenseDate)
        VALUES (@userID, @categoryID, @note, @expenseAmount, @expenseDate)
      `);
      res.status(200).send({ message: "Expense added successfully" });
  
    }catch(error){
        console.error("Error adding expense:", error);
        res.status(500).send({ message: "Error adding expense" });
    }
        
})

//add multiple expenses
router.post("/expenses/add-multiple",verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const  userID  = req.user.userID;
    const {  expenses } = req.body;
    
    for (const exp of expenses) {
      await pool.request()
        .input("userID", userID)
        .input("categoryID", exp.categoryID)
        .input("note", exp.note)
        .input("expenseAmount", exp.expenseAmount)
        .input("expenseDate", exp.expenseDate)
        .query(`
          INSERT INTO expense (userID, categoryID, note, expenseAmount, expenseDate)
          VALUES (@userID, @categoryID, @note, @expenseAmount, @expenseDate)
        `);
    }

    res.status(200).send({ message: "All expenses added successfully" });
  } catch (error) {
    console.error("Error adding multiple expenses:", error);
    res.status(500).send({ message: "Error adding expenses" });
  }
});

//delete expense
router.delete("/expenses/:expenseID",verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const { expenseID } = req.params;

    const result = await pool.request()
      .input("expenseID", sql.Int, expenseID)
      .query("DELETE FROM expense WHERE expenseID = @expenseID");

    if (result.rowsAffected[0] > 0) {
      res.status(200).json({ message: "Expense deleted successfully" });
    } else {
      res.status(404).json({ message: "Expense not found" });
    }
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//edit expenses 
router.put("/expense/:expenseID",verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const { expenseID } = req.params;
    const { categoryID, note, expenseAmount, expenseDate } = req.body;
    const result = await pool.request()
      .input("expenseID", sql.Int, expenseID)
      .input("categoryID", sql.Int, categoryID)
      .input("note", sql.NVarChar(255), note)
      .input("expenseAmount", sql.Decimal(10, 2), expenseAmount)
      .input("expenseDate", sql.Date, expenseDate)
      .query(`
        UPDATE expense 
        SET categoryID = @categoryID,
            note = @note,
            expenseAmount = @expenseAmount,
            expenseDate = @expenseDate
        WHERE expenseID = @expenseID
      `);

    if (result.rowsAffected[0] > 0) {
      res.status(200).send({ message: "Expense updated successfully" });
    } else {
      res.status(404).send({ message: "Expense not found" });
    }
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).send({ message: "Server error while updating expense" });
  }
});



module.exports=router;