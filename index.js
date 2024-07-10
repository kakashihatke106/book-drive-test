const bodyparser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

const session = require("express-session")
const usercontroller = require('./controller/usercontroller');
const { auth } = require('./middleware/validation');
require('dotenv').config()

const app = new express()

app.use(express.static('public'))
app.set('view engine', 'ejs');
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))
mongoose.connect(process.env.DB).then(() => {console.log("mongodb is connected")})

app.use(session({secret: 'deep'}))
app.get('/', usercontroller.dashboard)
app.get('/login', usercontroller.getlogin)
app.post('/login', usercontroller.postlogin)
app.get('/register', usercontroller.getregister)
app.post('/register', usercontroller.postregister)
app.get('/g2',auth, usercontroller.getg2)
app.post('/g2',auth, usercontroller.postg2)
app.get('/g',auth, usercontroller.getg)
app.post('/g/update_cardetail',auth, usercontroller.updatecardetail)
app.get('/logout', usercontroller.logout)

app.listen(5000, () => {
    console.log('server is running on port 3000')
})