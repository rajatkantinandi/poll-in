"use strict";
const mongo=require('mongodb').MongoClient;
const express=require('express');
const crypto=require('crypto');
function checkavail(user,res) {
    mongo.connect(process.env.MONGOURI, conn);
    function conn(err, client) {
        if (err) {
            throw err;
        }
        else {
            let db = client.db("voting-app");
            let collectn = db.collection("users");
            collectn.findOne({"username":user},(err,result)=>{
                if(!result){
                    res.status(200);
                    res.send("Username available");
                }
                else{
                    res.status(409);
                    res.send("Username unavailable");
                }
            });
        }
    }
}
function login(req,res,user,pass){
    mongo.connect(process.env.MONGOURI, conn);
    function conn(err, client) {
        if (err) {
            throw err;
        }
        else {
            let db = client.db("voting-app");
            let collectn = db.collection("users");
            collectn.findOne({"username":user},(err,result)=>{
                if(!result){
                    res.status(403).send("Invalid Username!!");
                }
                else{
                    let passString=hash(pass,result.salt);
                    if(passString==result.password){
                        req.session.auth={username:user};
                        res.status(200).redirect("/");
                    }
                    else{
                        res.status(403).send("Invalid password!!");
                    }
                }
            });
        }
    }
}
function signup(res,user,pass){
    let salt="number:"+Math.random()*50;
    mongo.connect(process.env.MONGOURI, conn);
    function conn(err, client) {
        if (err) {
            throw err;
        }
        else {
            let db = client.db("voting-app");
            let collectn = db.collection("users");
            collectn.findOne({"username":user},(err,result)=>{
                if(!result){
                    let hashed=hash(pass,salt);
                    collectn.insertOne({"username":user,"password":hashed,"salt":salt});
                    res.status(200).send("User "+user+" signed up successfully!!");
                }
                else{
                    res.status(404);
                    res.send("Username exist!!");
                }
            });
        }
    }
}
function getTrendingPolls(res){
    mongo.connect(process.env.MONGOURI, conn);
    function conn(err, client) {
        if (err) {
            throw err;
        }
        else {
            let db = client.db("voting-app");
            let collectn = db.collection("polls");
            collectn.find({}).sort({"totalvotes":-1}).toArray((err,docs)=>{
                res.send(docs);
            });
        }
    }
}
function vote(id,poll,res){
    mongo.connect(process.env.MONGOURI, conn);
    function conn(err, client) {
        if (err) {
            throw err;
        }
        else {
            let db = client.db("voting-app");
            let collectn = db.collection("polls");
            let o_id = new require('mongodb').ObjectID(id);
            collectn.updateOne({"_id":o_id,"options.value":poll},{$inc:{"totalvotes":1,"options.$.votes":1}});
            res.status(200).redirect("/trending-polls");
        }
    }
}
function createPoll(obj,res){
    mongo.connect(process.env.MONGOURI, conn);
    function conn(err, client) {
        if (err) {
            throw err;
        }
        else {
            let db = client.db("voting-app");
            let collectn = db.collection("polls");
            collectn.insertOne(obj,(err)=>{
                if(err) throw err;
                else res.status(200).redirect("/");
            });
        }
    }
}
function hash(input,salt){
    let hashed=crypto.pbkdf2Sync(input,salt,500,10,'md5');
    return hashed.toString('hex');
}
module.exports = { "checkavail": checkavail,"signup":signup,"signin":login,"getTrendingPolls":getTrendingPolls,"vote":vote,"createPoll":createPoll};