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
                    res.status(404);
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
                    res.status(404).send("Invalid Username!!");
                }
                else{
                    let passString=hash(pass,result.salt);
                    if(passString==result.password){
                        req.session.auth={username:user};
                        res.status(200).send("User "+user+" logged in successfully");
                    }
                    else{
                        res.status(404).send("Invalid password!!");
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
function hash(input,salt){
    let hashed=crypto.pbkdf2Sync(input,salt,500,10,'md5');
    return hashed.toString('hex');
}
module.exports = { "checkavail": checkavail,"signup":signup,"signin":login};