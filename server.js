"use strict"
const express=require('express');
const app=express();
const path=require('path');
app.use(express.static("public"));
//Ruuting
app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,"views","index.html"));
});
app.listen(process.env.port||3000,(err)=>{
    if(err) throw err;
    console.log("Server started at port 3000");
})
