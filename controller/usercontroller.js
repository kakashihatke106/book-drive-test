const path = require('path');
const usersmodel = require('../models/usersmodel');
const session = require("express-session")
const bcrypt = require('bcrypt');
const appointmentmodel = require('../models/appointmentmodel');
const { constants } = require('buffer');

function commanvariables(req) {
    return {
        error: req.flash('error'),
        UserType: req.session.UserType,
        islogedin: req.session.userid
    };
}

exports.dashboard = (req, res) => {
    try {
        res.render(path.resolve(__dirname, '../views/dashboard'), { ...commanvariables(req) })
    } catch (error) {
        console.log(error)
    }
}

exports.getlogin = (req, res) => {
    try {
        console.log('login get')
        res.render(path.resolve(__dirname, '../views/login'), { ...commanvariables(req) })
    } catch (error) {
        console.log(error)
    }
}

exports.postlogin = async (req, res) => {
    try {
        console.log('login post')
        const user = await usersmodel.findOne({ username: req.body.username.toLowerCase() })
        if (user) {
            if (user.UserType == req.body.UserType) {
                bcrypt.compare(req.body.password, user.password, (error, match) => {
                    if (error) {
                        console.log('compare error')
                        throw error;
                    }
                    if (match) {
                        console.log('login success')
                        req.session.userid = user._id;
                        req.session.UserType = user.UserType;
                        res.redirect('/')
                    } else {
                        console.log('password does not match')
                        req.flash("error", "please enter correct username or password")
                        res.redirect('/login')
                    }
                })
            } else {
                req.flash("error", "please enter correct username or password")
                res.redirect('/login')
            }
        } else {
            req.flash("error", "no account found on your username. would you like to register first")
            res.redirect('/register')
        }
    } catch (error) {
        console.log(error)
    }
}

exports.getregister = (req, res) => {
    try {
        res.render(path.resolve(__dirname, '../views/register'), { ...commanvariables(req) })
    } catch (error) {
        console.log(error)
    }
}

exports.postregister = async (req, res) => {
    try {
        console.log(req.body)
        const data = await usersmodel.create(req.body)
        console.log(data)
        res.redirect('/login')
    } catch (error) {
        if (error.code == 11000) {
            console.log("user already exiests")
            req.flash("error", "username already exists")
            res.redirect('/register')
        }
        console.log(error)
    }
}

exports.getg2 = async (req, res) => {
    try {
        const user = await usersmodel.findById(req.session.userid).populate('AppointmentID')
        const slots = req.flash("slots") || []
        console.log(slots, "sllllllllllllllllllllllllll")
        res.render(path.resolve(__dirname, '../views/g2'), { slots, Date: req.session.Date, isupdated: user.isupdated, userdata: user, ...commanvariables(req) })
    } catch (error) {
        console.log(error)
    }
}

exports.postg2 = async (req, res) => {
    try {
        req.body.car_detail = {
            make: req.body.make,
            model: req.body.model,
            year: req.body.year,
            plateNumber: req.body.plateNumber
        }
        req.body.isupdated = true;
        const user = await usersmodel.findByIdAndUpdate(req.session.userid, req.body, { new: true })
        res.redirect('/g2')
    } catch (error) {
        console.log(error)
    }
}

exports.getg = async (req, res) => {
    try {
        const user = await usersmodel.findById(req.session.userid).populate('AppointmentID')
        const slots = req.flash("slots") || []
        if (!user.isupdated) {
            return res.redirect('/g2')
        }
        res.render(path.resolve(__dirname, '../views/g'), { slots,Date: req.session.Date, isupdated: user.isupdated, userdata: user, ...commanvariables(req) })
    } catch (error) {
        console.log(error)
    }

}

exports.updatecardetail = async (req, res) => {
    try {
        car_detail = {
            make: req.body.make,
            model: req.body.model,
            year: req.body.year,
            plateNumber: req.body.plateNumber
        }

        const update = await usersmodel.findByIdAndUpdate(req.session.userid, { car_detail }, { new: true })
        res.redirect('/g');
    } catch (error) {
        console.log(error)
    }
}

exports.selectdate = async (req, res) => {
    try {
        const data = await appointmentmodel.find({ Date: req.body.Date }).select('Time')
        console.log(data, "data")
        req.session.Date = req.body.Date
        req.flash("addedTimeslots", data.length > 0 ? data : null)
        res.redirect('/appointment')

    } catch (error) {
        console.log(error)
    }
}

exports.getappointment = (req, res) => {
    try {

        console.log(req.session.Date, "Date in get")
        const addedTimeslots = req.flash('addedTimeslots')
        console.log(addedTimeslots)
        res.render(path.resolve(__dirname, '../views/appointment'), { addedTimeslots, Date: req.session.Date, ...commanvariables(req) })
    } catch (error) {
        console.log(error)
    }
}

exports.postappointment = async (req, res) => {
    try {
        if (!req.session.Date) {
            req.flash("error", "please select date")
            return res.redirect('/appointment')
        }
        console.log(req.body.Time, "added time")
        if (typeof req.body.Time != 'string') {
            for (Time of req.body.Time) {
                console.log("multiple date added")
                await appointmentmodel.findOneAndUpdate({ Date: req.session.Date, Time: Time }, { Date: req.session.Date, Time: Time }, { upsert: true })
            }
        } else {
            console.log("single date added")
            await appointmentmodel.findOneAndUpdate({ Date: req.session.Date, Time: req.body.Time }, { Date: req.session.Date, Time: req.body.Time }, { upsert: true })
        }
        res.redirect("/appointment")
    } catch (error) {
        if (error.code == 11000) {
            console.log("selected time is already added")
            req.flash("error", "selected time is already added")
            res.redirect('/appointment')
        }
        console.log(error)
    }
}

exports.logout = (req, res) => {
    try {
        console.log('logout success')
        req.session.destroy()
        res.redirect('/')
    } catch (error) {
        console.log(error)
    }
}

exports.findslots = (page) => async (req, res) => {
    try {
        const Date = req.body.Date
        const data = await appointmentmodel.find({ Date, isTimeSlotAvailable: true })
        console.log(data, "slots")
        req.session.Date = req.body.Date
        if (data.length > 0) {
            req.flash("slots", data);
            return res.redirect("/" + page)
        }
        return res.redirect("/" + page)
    } catch (error) {
        console.log(error)
    }
}

exports.bookappointment = (page) => async (req, res) => {
    try {
        if (typeof req.body.AppointmentID == "string" && req.body.AppointmentID) {
            await usersmodel.findByIdAndUpdate(req.session.userid, { AppointmentID: req.body.AppointmentID, TestType: page })
            await appointmentmodel.findByIdAndUpdate(req.body.AppointmentID, { isTimeSlotAvailable: false })
            req.flash("error", "Appointment booked successfully")
            return res.redirect("/" + page)
        } else {
            req.flash("error", "please select any one date")
            return res.redirect("/" + page)
        }
    } catch (error) {
        console.log(error)
    }
}



exports.getexaminer = async (req, res) => {
    try {
        const filter = {isTestPassed:null,AppointmentID:{$ne:null},UserType:'Driver'}
        const testtype = req.flash('testtype');
        if (testtype.length > 0) {
            console.log(testtype, "testtype")
            filter.TestType = testtype[0];
        }
        const users = await usersmodel.find(filter).populate('AppointmentID');

        res.render(path.resolve(__dirname, '../views/examiner'), { users, ...commanvariables(req) })

    } catch (error) {
        console.log(error)
    }
}

exports.postexaminer = async (req, res) => {
    try {

        req.flash('testtype', req.body.TestType);
        res.redirect('/examiner')


    } catch (error) {
        console.log(error)
    }
}

exports.getprofile=async (req,res)=>{
    try {
        console.log(req.params.id,"params id")
        const user =await usersmodel.findById(req.params.id)

        console.log(user)
        res.render(path.resolve(__dirname, '../views/profile'), { user, ...commanvariables(req) })

    } catch (error) {
        console.log(error)
    }
}
exports.postprofile = async (req,res)=>{
    try {
        const user =await usersmodel.findByIdAndUpdate(req.params.id,{isTestPassed:req.body.isTestPassed,comment:req.body.comment})

        console.log(user)
        res.redirect('/examiner')

    } catch (error) {
        console.log(error)
    }
}

exports.getresults= async (req, res) => {
    try {
        const filter = {isTestPassed:{$in:[true,false]}}
        const isTestPassed = req.flash('isTestPassed');
        if (isTestPassed.length > 0) {
            filter.isTestPassed = isTestPassed;
        }

        const users = await usersmodel.find(filter).populate('AppointmentID');

        res.render(path.resolve(__dirname, '../views/results'), { users, ...commanvariables(req) })
        console.log(users)

    } catch (error) {
        console.log(error)
    }
}
exports.postresults = async (req, res) => {
    try {

        req.flash('isTestPassed', req.body.isTestPassed);
        res.redirect('/results')


    } catch (error) {
        console.log(error)
    }
}