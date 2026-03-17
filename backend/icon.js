const express=require('express');
const {sql, poolPromise} = require('./index.js');
const verifyToken = require('./middleware/verifyToken.js');
const router=express.Router();

require('dotenv').config();

//get all icons
router.get('/icons',verifyToken,async(req,res)=>{
    try{
         const pool= await poolPromise;
        
        const result=await pool.request()
        .query("select * from icon");
        res.send(result.recordset);
    }catch(error){
        console.log("error",error);
        res.send("error for fetching recent expenses")
    }
   
})

module.exports=router;