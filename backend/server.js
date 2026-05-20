const express= require('express');
const cors=require('cors');

const users=require('./users.js');
const category=require('./category.js');
const expense=require('./expense.js');
const icon=require('./icon.js');
const budget=require('./budget.js');
const signup=require('./signup.js');

const app=express();//create server
app.use(cors());//enable cors so React frontend can access backend APIs.
app.use(express.json());//Converts incoming JSON request body into JavaScript object.
app.use(express.urlencoded({ extended: true }));//Used to handle form data sent from HTML forms.

app.use('/',users)
app.use('/',category)
app.use('/',expense)
app.use('/',icon)
app.use('/',budget)
app.use('/',signup)


app.listen(3002,()=>{
    console.log("server started at 3002");
})


