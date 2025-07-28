const express = require("express")
const users = express.Router();
const DB = require('../db/dbConn.js')
//88.200.63.148:5721










users.get('/session', async (req, res, next)=>{
    try{
        console.log("session data: ")
        console.log(req.session)
        res.json(req.session);
    }
    catch(err){
        console.log(err)
        res.sendStatus(500)
        next()
    }
  })

  users.get('/logout', async (req,res, next)=>{
    try{
        req.session.destroy(function(err) {
            res.json({status:{success: true, msg: err}})
        })
       
    }
    catch(err){
        console.log(err)
        res.json({status:{success: false, msg: err}})
        res.sendStatus(500)
        next()
    }
 })
 

users.post('/login', async (req, res) => {
  var username = req.body.username;
  var password = req.body.password;

  if (username && password) {
    try {
      let queryResult = await DB.AuthUser(username);

      if (queryResult.length > 0) {
        if (password === queryResult[0].user_password) {
          console.log("LOGIN OK");

          let id = queryResult[0].id;
            
            
            console.log("user id from authUser:", id);
        
          let userDetails = await DB.GetUserDetails(id);
          console.log("User ID from AuthUser:", id);

          if (userDetails.length > 0) {
            let vloga_id = userDetails[0].vloga_id;
            let role = 'pacient'; // default

            if (vloga_id === 300) role = 'zdravnik';
            else if (vloga_id === 900) role = 'admin';

            req.session.logged_in = true;
            req.session.user_id = id;
            req.session.role = role;

            res.status(200).json({ success: true, role: role, message: "LOGIN OK" });
          } else {
            res.status(404).json({ success: false, message: "User details not found" });
          }
        } else {
          console.log("INCORRECT PASSWORD");
          res.status(200).json({ success: false, message: "INCORRECT PASSWORD" });
        }
      } else {
        console.log("USER NOT REGISTERED");
        res.status(200).json({ success: false, message: "USER NOT REGISTERED" });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  } else {
    console.log("Please enter Username and Password!");
    res.status(400).json({ success: false, message: "Please enter Username and Password!" });
  }
});


users.get('/list', async (req, res, next)=>{
    
    if (req.session.logged_in == true){
            try{
        var queryResult = await DB.allUsers();
        console.log("All user")
        res.json(queryResult)
    }
    catch(err){
        console.log(err)
        res.sendStatus(500)
        next()
    }

    }        else {
                console.log("USER NOT REGISTRED");
                res.json({ success: false, message: "USER NOT REGISTRED" });
                res.status(200)
            }

  })


users.post('/new', async (req, res) => {
    var id = req.body.id;
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;

    if (req.session.logged_in == true) {
        try {
            var queryResult = await DB.creteUser(id, username, email, password);

            if (queryResult.user_login?.affectedRows > 0 && queryResult.uporabnik?.affectedRows > 0) {
                console.log("New User Added!!");
                res.json({ success: true, message: "User added successfully" });
            } else {
                console.log("User not added.");
                res.json({ success: false, message: "User not added." });
            }
        } catch (err) {
            console.log(err);
            res.sendStatus(500);
        }
    } else {
        if (req.session.logged_in == false) {
            console.log("Please Login!");
            res.status(401).json({ success: false, message: "Please Login" });
        } else if (!id || !username || !email || !password) {
            console.log("Please enter your ID, then users Username, Email and Password for new user!");
            res.status(400).json({ success: false, message: "Please enter your ID, then user's Username, Email and Password for new user!" });
        }
    }
});





module.exports = users
