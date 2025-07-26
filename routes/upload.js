const multer = require('multer');
const express = require("express")
const upload = express.Router();
const DB = require('../db/dbConn.js')



let upload_dest = multer({ dest: 'uploads/' })


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
