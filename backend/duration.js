const express=require('express');
const {sql,poolPromise }=require('./index.js');
const verifyToken = require('./middleware/verifyToken.js');
const router=express.Router();
require('dotenv').config;

//add duration
router.post('/duration/add',async(req,res)=>{
    try{
    const pool=await poolPromise;
    const {fromDate,toDate}=req.body;
    const result=await pool.request()
    .input('fromDate',sql.DateTime,fromDate)
    .input('toDate',sql.DateTime,toDate)
    .query('insert into duration (fromDate,toDate) values(@fromDate,@toDate)')

     if (result.rowsAffected[0] > 0) {
      res.status(200).send({ message: "duration addedd successfully" });
    } else {
      res.status(404).send({ message: "duration not found" });
    }
  } catch (error) {
    console.error("Error adding duration:", error);
    res.status(500).send({ message: "Server error while adding duration" });
  }
})

// 
router.get('/duration',verifyToken,async(req,res)=>{
    try{
        const pool=await poolPromise;
        const result=await pool.request()
        .query("select * from budget ")
        res.send(result.recordset)
    }catch(error){
        console.log("error",error);
        res.send("cannot fetch duration")
    }
    
})

module.exports=router;