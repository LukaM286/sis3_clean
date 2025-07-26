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
 

//Checks if user submitted both fields, if user exist and if the combination of user and password matches
users.post('/login', async (req, res) => {

    var username = req.body.username;
    var password = req.body.password;
    
    if (username && password) {
        try {
            let queryResult = await DB.AuthUser(username);

            if (queryResult.length > 0) {
                if (password === queryResult[0].user_password) {
                    console.log(queryResult)
                    console.log("LOGIN OK");
                    
                    req.session.logged_in = true;

                    //res.json(req.session.queryResult[0].user_email);
                    

                    
                    
                    res.json({ success: true, message: "LOGIN OK" });
                    res.status(200)
                }
                else {
                    console.log("INCORRECT PASSWORD");
                    res.json({ success: false, message: "INCORRECT PASSWORD" });
                    res.status(200)
                }
            } else {
                console.log("USER NOT REGISTRED");
                res.json({ success: false, message: "USER NOT REGISTRED" });
                res.status(200)
            }
        }
        catch (err) {
            console.log(err)
            res.status(404)
        }
    }
    else {
        console.log("Please enter Username and Password!")
        res.json({ success: false, message: "Please enter Username and Password!" });
        res.status(204)
    }
    res.end();
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

    //var new_user = id && username && email && password;
    
    
    if (req.session.logged_in == true) {
                try {
                    var queryResult = await DB.creteUser(id, username, email, password)
                    if (queryResult.affectedRows) {
                        console.log("New User Added!!")
                    }
                    console.log("News User Added")
                }
                catch (err) {
                    console.log(err)
                    res.sendStatus(500)
                }
    }
    else {

        if(req.session.logged_in == false){
            console.log("Please Login!")
            res.json({ success: false, message: "Please Login" });
            res.status(204)
        }
        if(!id || !username || !email || !password){
            console.log("Please enter your ID, then users Username, Email and Password for new user!")
            res.json({ success: false, message: "Please enter your ID, then users Username, Email and Password for new user!" });
            res.status(204)
        }
        
    }
    res.end();
});

// Inserts a new user in our database


module.exports = users
