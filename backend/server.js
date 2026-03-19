const express= require('express');
const cors=require('cors');

const users=require('./users.js');
const category=require('./category.js');
const expense=require('./expense.js');
const icon=require('./icon.js');
const duration=require('./duration.js');
const budget=require('./budget.js');
const signup=require('./signup.js');

const app=express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/',users)
app.use('/',category)
app.use('/',expense)
app.use('/',icon)
app.use('/',duration)
app.use('/',budget)
app.use('/',signup)


app.listen(3002,()=>{
    console.log("server started at 3002");
})


