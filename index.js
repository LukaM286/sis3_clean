
const express = require('express')
require('dotenv').config()
const app = express()
const cors = require("cors")
const path = require('path')
const port = process.env.PORT || 7555


const novice = require('./routes/novice') 
const users = require('./routes/users')
const upload = require('./routes/upload')

const session = require('express-session')

app.set('trust proxy', 1) 
app.use(session({
   secret: 'some secret',
   resave: true,
   saveUninitialized: true,
   cookie: { secure: false }
}))

app.use(express.json());
app.use(express.urlencoded({extended : true}));


app.use(cors({
   origin: 'http://localhost:8080',
   methods: ['GET', 'POST', 'PUT', 'OPTIONS', 'HEAD'],
   credentials: true
}));


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"))
})

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

app.use('/novice', novice)
app.use('/users', users)
app.use('/uploadFile', upload)
app.use('/delete', novice)
app.use('/list', users)

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
