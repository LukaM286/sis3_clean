const express = require("express")
const novice = express.Router();
const DB = require('../db/dbConn.js')
const multer = require('multer');
const upload = express.Router();
let upload_dest = multer({ dest: 'uploads/' })


//Ustvari nov endpoint GET /novice/delete/:id ki bo izbrisal novico z id številko. Če je bil izbris uspešen API odgovori:
novice.get('/delete/:id', async (req, res, next) => {
    try {
        var queryResult = await DB.deleteNovica(req.params.id)
        console.log("novica deleted")
        res.json(queryResult)
    }
    catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})


//Gets all the news in the DB
novice.get('/', async (req, res, next) => {
    try {
        var queryResult = await DB.allNovice();
        res.json(queryResult)
    }
    catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})



//Gets one new based on the id
novice.get('/:id', async (req, res, next) => {
    try {
        var queryResult = await DB.oneNovica(req.params.id)
        res.json(queryResult)
    }
    catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})



/*
upload.post('/', upload_dest.single('file'), async (req, res, next) => {
    const file = req.file;
    console.log(file.filename);
    if (!file && req.session.logged_in != true) {
      res.send({ status: { success: false, msg: "Could not uplpad" }});
    }else{
      res.send({ status: { success: true, msg: "File upladed" }});
    }  
 })
 
 module.exports = upload
*/


novice.post('/',upload_dest.single('file'),  async (req, res, next) => {

    let title = req.body.title
    let slug = req.body.slug
    let text = req.body.text
    const file = req.file;
    console.log(file.filename);
    
    if (!file && req.session.logged_in != true) {
        res.send({ status: { success: false, msg: "Could not uplpad" }});
      }else{
        res.send({ status: { success: true, msg: "File upladed" }});
    }


    var isAcompleteNovica = title && slug && text
    if (isAcompleteNovica && req.session.logged_in == true) {
        try {
            var queryResult = await DB.creteNovica(title, slug, text)
            if (queryResult.affectedRows) {
                console.log("New article added!!")
            }
            console.log("News item added")
        }
        catch (err) {
            console.log(err)
            res.sendStatus(500)
        }
    }
    else {
        console.log("A field is empty!!")
        console.log("Can not add news. You need to log-in!")
    }
    res.end()


})
module.exports = novice

/*
//Inserts one new item to the database
novice.post('/',  async (req, res, next) => {

    let title = req.body.title
    let slug = req.body.slug
    let text = req.body.text


    var isAcompleteNovica = title && slug && text
    if (isAcompleteNovica && req.session.logged_in == true) {
        try {
            var queryResult = await DB.creteNovica(title, slug, text)
            if (queryResult.affectedRows) {
                console.log("New article added!!")
            }
            console.log("News item added")
        }
        catch (err) {
            console.log(err)
            res.sendStatus(500)
        }
    }
    else {
        console.log("A field is empty!!")
        console.log("Can not add news. You need to log-in!")
    }
    res.end()


})
module.exports = novice */
