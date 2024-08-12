const bodyparser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const flash = require('connect-flash');

const session = require("express-session")
const usercontroller = require('./controller/usercontroller');
const { auth } = require('./middleware/validation');
require('dotenv').config()

const app = new express()

app.use(express.static('public'))
app.set('view engine', 'ejs');
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))
mongoose.connect(process.env.DB).then(() => { console.log("mongodb is connected") })

app.use(session({ secret: 'deep' }))
app.use(flash())

app.get('/', usercontroller.dashboard)
app.get('/login', usercontroller.getlogin)
app.post('/login', usercontroller.postlogin)
app.get('/register', usercontroller.getregister)
app.post('/register', usercontroller.postregister)
app.get('/g2', auth('Driver'), usercontroller.getg2)
app.post('/g2', auth('Driver'), usercontroller.postg2)
app.get('/g', auth('Driver'), usercontroller.getg)
app.post('/g/update_cardetail', auth('Driver'), usercontroller.updatecardetail)

app.post('/book-appointment', auth('Driver'), usercontroller.bookappointment('g2'))
app.post('/find-slots', auth('Driver'), usercontroller.findslots('g2'))

app.post('/book-appointment-g', auth('Driver'), usercontroller.bookappointment('g'))
app.post('/find-slots-g', auth('Driver'), usercontroller.findslots('g'))

app.get('/appointment', auth('Admin'), usercontroller.getappointment)
app.post('/select-date', auth('Admin'), usercontroller.selectdate)
app.post('/appointment', auth('Admin'), usercontroller.postappointment)
app.get('/results', auth('Admin'), usercontroller.getresults)
app.post('/results', auth('Admin'), usercontroller.postresults)


app.get('/examiner', auth('Examiner'), usercontroller.getexaminer)
app.post('/examiner', auth('Examiner'), usercontroller.postexaminer)
app.get('/profile/:id', auth('Examiner'), usercontroller.getprofile)
app.post('/profile/:id', auth('Examiner'), usercontroller.postprofile)


app.get('/logout', usercontroller.logout)

app.listen(4000, () => {
    console.log('server is running on port 3000')
})