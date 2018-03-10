"use strict"
require('dotenv/config');
const express=require('express');
const session=require('express-session');
const app=express();
const path=require('path');
const bodyparser=require('body-parser');
const mongoapi=require('./mongoapi');
app.use(express.static("public"));
app.use(bodyparser.urlencoded({extended: false}));
app.use(session({
    secret:"Number :"+Math.random()*25,
    cookie:{maxAge:1000*60*60*24*30}
}));
//Routing
app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,"views","index.html"));
});
app.post('/signin',(req,res)=>{
    let username=req.body.username;
    let password=req.body.password;
    mongoapi.signin(req,res,username,password);
});
app.post('/signup',(req,res)=>{
    let username=req.body.username;
    let password=req.body.password;
    mongoapi.signup(res,username,password);
});
app.get('/checkavailuser/:username',(req,res)=>{
    mongoapi.checkavail(req.params.username,res);
});
app.get('/checkloggedin',(req,res)=>{
    if(req.session&&req.session.auth&&req.session.auth.username){
        res.status(200).send({user:req.session.auth.username});
    }
    else{
        res.status(401).send({user:null});
    }
});
app.get('/signout',(req,res)=>{
    req.session.destroy();
    res.redirect('/');
});
app.get('/trending-polls',(req,res)=>{
    mongoapi.getTrendingPolls(res);
});
app.post('/vote',(req,res)=>{
    let poll=req.body.poll;
    let id=req.body.id;
    mongoapi.vote(id,poll,res);
});
app.post('/create-poll',(req,res)=>{
    let question=req.body.question;
    let options=[];
    options.push({"value":req.body.option1,"votes":0});
    options.push({"value":req.body.option2,"votes":0});
    options.push({"value":req.body.option3,"votes":0});
    options.push({"value":req.body.option4,"votes":0});
    let obj={
        "question":question,
        "options":options,
        "createdBy":"rajatkn",
        "totalvotes":0
    };
    mongoapi.createPoll(obj,res);
});
app.listen(process.env.PORT,(err)=>{
    if(err) throw err;
    console.log("Server started at port "+process.env.PORT);
});
