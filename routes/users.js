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
            if(vloga_id === 800) role = 'CKZ';
            else if (vloga_id === 900) role = 'admin';
            

            req.session.logged_in = true;
            req.session.user_id = id;
            req.session.vloga_id = vloga_id;
            req.session.role = role;
            


           res.status(200).json({
            success: true,
            role: role,
            vloga_id: vloga_id,
            id: id,  
            message: "LOGIN OK"
            });

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


users.get('/list', async (req, res, next) => {
  if (req.session.logged_in === true) {
    try {
      const queryResult = await DB.allUsers();
      console.log("All users");
      res.json({ success: true, users: queryResult }); 
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, message: "Napaka pri poizvedbi." });
      next();
    }
  } else {
    console.log("USER NOT REGISTERED");
    res.status(401).json({ success: false, message: "USER NOT REGISTERED" });
  }
});

users.get('/kartoni', async (req, res) => {
  if (req.session.logged_in === true) {
    try {
      const kartoni = await DB.allKarton();
      res.json({ success: true, kartoni });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Napaka pri poizvedbi kartonov." });
    }
  } else {
    res.status(401).json({ success: false, message: "Neavtoriziran dostop." });
  }
});

users.post('/kartoni/delete', async (req, res) => {
  if (req.session.logged_in === true) {
    const { id } = req.body; 

    if (!id) {
      return res.status(400).json({ success: false, message: "ID kartona ni podan." });
    }

    try {
      await DB.deleteKartonById(id); 
      res.json({ success: true, message: "Karton uspešno izbrisan." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Napaka pri brisanju kartona." });
    }
  } else {
    res.status(401).json({ success: false, message: "Neavtoriziran dostop." });
  }
});





users.post('/addObravnava', async (req, res) => {
  const {
    id,
    karton_id,
    tip_obravnave,
    opis,
    datum,
    izvajalec_id,
    pacient_id
  } = req.body;

  if (req.session.logged_in !== true || req.session.vloga_id !== 300) {
    return res.status(403).json({ success: false, message: "Dostop zavrnjen." });
  }

  try {
    await DB.addObravnava({
      id,
      karton_id,
      tip_obravnave,
      opis,
      datum,
      izvajalec_id,
      pacient_id
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Napaka pri dodajanju obravnave." });
  }
});

users.get("/obravnava/:id", async (req, res) => {
  const pacientId = req.params.id;

  try {
    const obravnave = await DB.obravnaveZaPacienta(pacientId);
    res.json({ success: true, obravnave });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Napaka pri pridobivanju obravnav." });
  }
});

users.get('/obravnave', async (req, res) => {

  try {
    const obravnave = await DB.getAllObravnave();
    res.json({ success: true, obravnave });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});






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

users.post('/new/dosezek', async (req, res) => {
  const { id, obravnava_id, cilji_dosezeni, opombe } = req.body;

  console.log("Prejeli podatki:", req.body);


  try {
    const queryResult = await DB.creteCKZdosezki(id, obravnava_id, cilji_dosezeni, opombe);

    if (queryResult.affectedRows > 0) {
      console.log("New CKZ dosežki added!");
      res.json({ success: true, message: "CKZ dosežki added successfully" });
    } else {
      console.log("CKZ dosežki not added.");
      res.status(500).json({ success: false, message: "Failed to add CKZ dosežki" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});




users.get("/karton/:id", async (req, res) => {
  const pacientId = req.params.id;

  try {
    const karton = await DB.getElektronskiKarton(pacientId);
    if (!karton) {
      return res.status(404).json({ success: false, message: "Karton ni najden." });
    }

    res.json({ success: true, karton });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Napaka pri pridobivanju kartona." });
  }
});

users.post("/karton/:id", async (req, res) => {
  const pacientId = req.params.id;
  const { tezave, samomeritve, zdravila } = req.body;

  try {
    await DB.updateElektronskiKarton(pacientId, { tezave, samomeritve, zdravila });
    res.json({ success: true, message: "Karton uspešno posodobljen." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Napaka pri posodabljanju kartona." });
  }
});


users.get("/obravnava/:id/diagnoze", async (req, res) => {
  const obravnavaId = req.params.id;

  try {
    const diagnoze = await DB.diagnozeZaObravnavo(obravnavaId);
    res.json({ success: true, diagnoze });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Napaka pri pridobivanju diagnoz." });
  }
});



users.get('/poziv', async (req, res) => {
  if (req.session.logged_in === true && req.session.role === 'pacient') {
    try {
      const pacientId = req.session.user_id;

      const pozivi = await DB.getPoziviZaPacienta(pacientId); 

      res.json({ success: true, pozivi });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Napaka pri pridobivanju pozivov." });
    }
  } else {
    res.status(403).json({ success: false, message: "Dostop zavrnjen." });
  }
});




module.exports = users
