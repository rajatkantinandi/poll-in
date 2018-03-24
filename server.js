"use strict"
require('dotenv/config');
const express=require('express');
const session=require('express-session');
const app=express();
const path=require('path');
const bodyparser=require('body-parser');
const mongoapi=require('./mongoapi');
const exphbs  = require('express-handlebars');
 
app.engine('handlebars', exphbs({
    defaultLayout: 'main',
    layoutsDir:path.join(__dirname,"views","layouts"),
    helpers:{
        'stringify':(obj)=>JSON.stringify(obj),
        'eq':(arg1,arg2)=>{
            if(arg1==arg2)
            return true;
            else return false;
        }
    }
}));
app.set('views', path.join(__dirname, 'views/'));
app.set('view engine', 'handlebars');
app.use(express.static("public"));
app.use(bodyparser.urlencoded({extended: false}));
app.use(session({
    secret:"Number :"+Math.random()*25,
    cookie:{maxAge:1000*60*60*24*30},
    resave:false,
    saveUninitialized:true
}));
//Routing
app.get('/', function (req, res) {
    mongoapi.mongoExec(["polls"],(collectn)=>{
        collectn.find({}).sort({ "totalvotes": -1 }).toArray((err, result) => {            
            if(req.session&&req.session.auth&&req.session.auth.userid){
                res.render('index',{title:'Poll-in: The Voting App',username:req.session.auth.username,userid:req.session.auth.userid,polls:result,loggedout:false,style:"style.css",client:"client.js",usersc:"user.js"});
            }else{
                    res.render('index',{title:'Poll-in: The Voting App',username:null,polls:result,loggedout:true,style:"style.css",client:"client.js",usersc:"user.js"});
            }
        });
    })
});
app.get('/poll/:id',(req,res)=>{
    mongoapi.mongoExec(["polls"],(collectn)=>{        
        let o_id = new require('mongodb').ObjectID(req.params.id);
        collectn.findOne({"_id":o_id},(err,doc)=>{
            if(err) throw err;
            if(req.session&&req.session.auth&&req.session.auth.userid){
                res.render('poll',{title:'Poll-in: The Voting App',username:req.session.auth.username,userid:req.session.auth.userid,poll:doc,loggedout:false,style:"../style.css",client:"../client.js",usersc:"../user.js"});
            }else{
                    res.render('poll',{title:'Poll-in: The Voting App',username:null,poll:doc,loggedout:true,style:"../style.css",client:"../client.js",usersc:"../user.js"});
            }
        });
    });
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
    if(req.session&&req.session.auth&&req.session.auth.userid){
        mongoapi.showuser(req.session.auth.userid,res);
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
    if(req.session&&req.session.auth&&req.session.auth.userid){
    let options=[];
    options.push({"value":req.body.option1,"votes":0});
    options.push({"value":req.body.option2,"votes":0});
    options.push({"value":req.body.option3,"votes":0});
    options.push({"value":req.body.option4,"votes":0});
    let obj={
        "question":question,
        "options":options,
        "createdBy":req.session.auth.userid,
        "totalvotes":0
    };
    mongoapi.createPoll(obj,res);
    }
    else{
        res.status(403).send("Unauthorised Access");
    }
});
app.get("/user/:userid",(req,res)=>{
    mongoapi.getUserPage(req.params.userid,res);
});
app.get("/deletepoll",(req,res)=>{
    let userid=req.query.userid;
    let pollid=req.query.id;
    console.log(pollid+"\n"+userid);
    mongoapi.deletePoll(userid,pollid,res);
});
app.listen(process.env.PORT,(err)=>{
    if(err) throw err;
    console.log("Server started at port "+process.env.PORT);
});
