const express = require('express')
const connectDB = require('./db/connect_DB')
const { connect } = require('mongoose')
const app = express()
const port = 3000
const web = require('./routes/web')
var session = require('express-session')
var flash = require('connect-flash');
const fileUpload = require("express-fileupload");
const cookieParser = require('cookie-parser')
//cookies

app.use(cookieParser())
//Temp file uploader

app.use(fileUpload({useTempFiles: true}));//for uploading image

app.use(session({
    secret: 'secret',
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false,
  }));

app.use(flash());  //FOR showing message

app.use(express.urlencoded({ extended: true }));

connectDB()

app.set('view engine', 'ejs')

app.use('/',web)

app.use(express.static('public'))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})