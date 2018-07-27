"use strict";
const mongo = require("mongodb").MongoClient;
const express = require("express");
const crypto = require("crypto");
function mongoExec(collectionNames, callback) {
  mongo.connect(
    process.env.MONGOURI,
    conn
  );
  function conn(err, client) {
    if (err) {
      throw err;
    } else {
      let db = client.db("voting-app");
      let collectn = db.collection(collectionNames[0]);
      if (collectionNames.length > 1) {
        let collectn2 = db.collection(collectionNames[1]);
        callback(collectn, collectn2);
      } else {
        callback(collectn);
      }
    }
  }
}
function checkavail(user, res) {
  mongoExec(["users"], collectn => {
    collectn.findOne({ username: user }, (err, result) => {
      if (!result) {
        res.status(200);
        res.send("Username available");
      } else {
        res.status(409);
        res.send("Username unavailable");
      }
    });
  });
}
function login(req, res, user, pass) {
  mongoExec(["users"], collectn => {
    collectn.findOne({ username: user }, (err, result) => {
      if (!result) {
        res.status(403).json({ err: "Invalid Username!! " + user });
      } else {
        let passString = hash(pass, result.salt);
        if (passString == result.password) {
          req.session.auth = { userid: result["_id"], username: user };
          res.status(200).json({ username: user, userid: result["_id"] });
        } else {
          res.status(403).json({ err: "Invalid password!! " + pass });
        }
      }
    });
  });
}
function signup(res, user, pass) {
  let salt = "number:" + Math.random() * 50;
  mongoExec(["users"], collectn => {
    collectn.findOne({ username: user }, (err, result) => {
      if (!result) {
        let hashed = hash(pass, salt);
        collectn.insertOne({ username: user, password: hashed, salt: salt });
        res.status(200).send("User " + user + " signed up successfully!!");
      } else {
        res.status(401);
        res.json({ err: "Username exist!!" });
      }
    });
  });
}
function getTrendingPolls(res) {
  mongoExec(["polls"], collectn => {
    collectn
      .find({})
      .sort({ totalvotes: -1 })
      .toArray((err, docs) => {
        res.send(docs);
      });
  });
}
function vote(id, poll, res) {
  mongoExec(["polls"], collectn => {
    let o_id = new require("mongodb").ObjectID(id);
    collectn.updateOne(
      { _id: o_id, "options.value": poll },
      { $inc: { totalvotes: 1, "options.$.votes": 1 } },
      (err, result) => {
        if (err)
          res
            .status(404)
            .json({ err: "Invalid poll id! Not found! Voting Unsuccessful!!" });
      }
    );
    res.status(200).send("voted successfully");
  });
}
function createPoll(obj, res) {
  mongoExec(["polls", "users"], (collectn, collectn2) => {
    let o_id = new require("mongodb").ObjectID(obj.createdBy);
    collectn2.findOne({ _id: o_id }, (err, result) => {
      if (err) throw err;
      else if (result) {
        obj.createdBy = result.username;
        obj.at = new Date().toLocaleString();
        collectn.insertOne(obj, err => {
          if (err) throw err;
          else res.status(200).redirect("/");
        });
      } else {
        res.status(403).send("Unauthorised user!!");
      }
    });
  });
}
function showuser(id, res) {
  mongoExec(["users"], collectn => {
    let o_id = new require("mongodb").ObjectID(id);
    collectn.findOne({ _id: o_id }, (err, result) => {
      if (err) throw err;
      else if (result) {
        res
          .status(200)
          .send({ user: result["_id"], username: result.username });
      } else {
        res.status(403).send("Unauthorised access");
      }
    });
  });
}
function getUserPage(userid, res) {
  mongoExec(["users", "polls"], (collectn, collectn2) => {
    let o_id = new require("mongodb").ObjectID(userid);
    collectn.findOne({ _id: o_id }, (err, result) => {
      if (err) throw err;
      else if (result) {
        let username = result.username;
        let responseToSend = {
          username: username,
          polls: []
        };
        collectn2.find({ createdBy: username }).toArray((err, results) => {
          if (err) throw err;
          results.forEach(element => {
            responseToSend.polls.push(element);
          });
          res.status(200).send(JSON.stringify(responseToSend));
        });
      } else {
        res.status(403).send("Unauthorised access");
      }
    });
  });
}

function deletePoll(userid, pollid, res) {
  mongoExec(["polls", "users"], (collectn, collectn2) => {
    let o_id = new require("mongodb").ObjectID(userid);
    collectn2.findOne({ _id: o_id }, (err, result) => {
      if (err) throw err;
      let username = result.username;
      let o_id2 = new require("mongodb").ObjectID(pollid);
      collectn.deleteOne({ _id: o_id2, createdBy: username }, (err, doc) => {
        if (err) throw err;
        else if (!doc) {
          res.status(403).send("Unautorised Access");
        } else {
          res.status(200).send("✔ Deleted");
        }
      });
    });
  });
}
function updatePoll(pollid, option, method, res) {
  if (method == "add") {
    mongoExec(["polls"], collectn => {
      let o_id = new require("mongodb").ObjectID(pollid);
      collectn.updateOne(
        { _id: o_id },
        {
          $push: { options: { value: option, votes: 1 } },
          $inc: { totalvotes: 1 }
        }
      );
      res.status(200).send("Success!!");
    });
  }
}
function hash(input, salt) {
  let hashed = crypto.pbkdf2Sync(input, salt, 500, 10, "md5");
  return hashed.toString("hex");
}
module.exports = {
  checkavail: checkavail,
  signup: signup,
  signin: login,
  getTrendingPolls: getTrendingPolls,
  vote: vote,
  createPoll: createPoll,
  showuser: showuser,
  getUserPage: getUserPage,
  deletePoll: deletePoll,
  mongoExec: mongoExec,
  updatePoll: updatePoll
};
