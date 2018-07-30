"use strict";
require("dotenv/config");
const express = require("express");
const session = require("express-session");
const app = express();
const path = require("path");
const bodyparser = require("body-parser");
const mongoapi = require("./mongoapi");
const exphbs = require("express-handlebars");
const cors = require("cors");
app.use(cors());
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views", "layouts"),
    helpers: {
      stringify: obj => JSON.stringify(obj),
      eq: (arg1, arg2) => {
        if (arg1 == arg2) return true;
        else return false;
      }
    }
  })
);
app.set("views", path.join(__dirname, "views/"));
app.set("view engine", "handlebars");
app.use(express.static("public"));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  session({
    secret: "Number :" + Math.random() * 25,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 },
    resave: true,
    saveUninitialized: false
  })
);
//Routing
app.get("/", function(req, res) {
  mongoapi.mongoExec(["polls"], collectn => {
    collectn
      .find({})
      .sort({ totalvotes: -1 })
      .toArray((err, result) => {
        if (req.session && req.session.auth && req.session.auth.userid) {
          res.render("index", {
            title: "Poll-in: The Voting App",
            username: req.session.auth.username,
            userid: req.session.auth.userid,
            polls: result,
            loggedout: false,
            style: "style.css",
            client: "client.js",
            usersc: "user.js",
            userpage: false
          });
        } else {
          res.render("index", {
            title: "Poll-in: The Voting App",
            username: null,
            polls: result,
            loggedout: true,
            style: "style.css",
            client: "client.js",
            usersc: "user.js",
            userpage: false
          });
        }
      });
  });
});
app.get("/poll/:id", (req, res) => {
  mongoapi.mongoExec(["polls"], collectn => {
    let o_id = new require("mongodb").ObjectID(req.params.id);
    collectn.findOne({ _id: o_id }, (err, doc) => {
      if (err) throw err;
      if (req.session && req.session.auth && req.session.auth.userid) {
        res.render("poll", {
          title: "Poll-in: " + doc.question,
          username: req.session.auth.username,
          userid: req.session.auth.userid,
          poll: doc,
          loggedout: false,
          style: "../style.css",
          client: "../client.js",
          usersc: "../user.js"
        });
      } else {
        res.render("poll", {
          title: "Poll-in: " + doc.question,
          username: null,
          poll: doc,
          loggedout: true,
          style: "../style.css",
          client: "../client.js",
          usersc: "../user.js"
        });
      }
    });
  });
});
app.get("/user/:username", (req, res) => {
  mongoapi.mongoExec(["polls"], collectn => {
    collectn
      .find({ createdBy: req.params.username })
      .toArray((err, results) => {
        if (err) throw err;
        if (req.session && req.session.auth && req.session.auth.userid) {
          res.render("index", {
            title: "Poll-in: The Voting App",
            username: req.session.auth.username,
            userid: req.session.auth.userid,
            polls: results.reverse(),
            loggedout: false,
            style: "../style.css",
            client: "../client.js",
            usersc: "../user.js",
            userpage: true,
            pageuser: req.params.username
          });
        } else {
          res.render("index", {
            title: "Poll-in: The Voting App",
            username: null,
            polls: results.reverse(),
            loggedout: true,
            style: "../style.css",
            client: "../client.js",
            usersc: "../user.js",
            userpage: true,
            pageuser: req.params.username
          });
        }
      });
  });
});
app.post("/signin", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  mongoapi.signin(req, res, username, password);
});
app.post("/signup", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  mongoapi.signup(res, username, password);
});
app.get("/checkavailuser/:username", (req, res) => {
  mongoapi.checkavail(req.params.username, res);
});
app.get("/checkloggedin", (req, res) => {
  if (req.session && req.session.auth && req.session.auth.userid) {
    mongoapi.showuser(req.session.auth.userid, res);
  } else {
    res.status(401).send({ user: null });
  }
});
app.get("/signout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});
app.get("/trending-polls", (req, res) => {
  mongoapi.getTrendingPolls(res);
});
app.post("/vote", (req, res) => {
  let poll = req.body.poll;
  let id = req.body.id;
  mongoapi.vote(id, poll, res);
});
app.post("/create-poll", (req, res) => {
  let question = req.body.question;
  let numOfOptions = req.body.numOfOptions;
  if (req.session && req.session.auth && req.session.auth.userid) {
    let options = [];
    for (let i = 1; i <= numOfOptions; i++) {
      options.push({ value: req.body["option" + i], votes: 0 });
    }
    let obj = {
      question: question,
      options: options,
      createdBy: req.session.auth.userid,
      totalvotes: 0
    };
    mongoapi.createPoll(obj, res);
  } else {
    res.status(403).send("Unauthorised Access");
  }
});
app.get("/u/:userid", (req, res) => {
  mongoapi.getUserPage(req.params.userid, res);
});
app.get("/deletepoll", (req, res) => {
  let userid = req.query.userid;
  let pollid = req.query.id;
  console.log(pollid + "\n" + userid);
  mongoapi.deletePoll(userid, pollid, res);
});
app.get("/update-poll", (req, res) => {
  if (req.session && req.session.auth && req.session.auth.userid) {
    let pollid = req.query.id;
    let option = req.query.option;
    mongoapi.updatePoll(pollid, option, "add", res);
  } else {
    res.status(403).send("Access Denied");
  }
});
app.post("/survey", (req, res) => {
  //Parameters
  let name = req.body.name;
  let email = req.body.email;
  let age = req.body.age;
  let source = req.body.source;
  let recommend = req.body.recommend;
  let improvement = req.body.improvement;
  let suggestions = req.body.suggestions;
  let survey = {
    name: name,
    email: email,
    age: age,
    source: source,
    recommend: recommend,
    improvement: improvement,
    suggestions: suggestions
  };
  mongoapi.mongoExec(["surveys"], collectn => {
    collectn.insertOne(survey);
    res.status(200).send("Successfully Submitted!!");
  });
});
app.listen(process.env.PORT, err => {
  if (err) throw err;
  console.log("Server started at port " + process.env.PORT);
});
