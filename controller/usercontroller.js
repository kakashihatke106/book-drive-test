const path = require('path');
const usersmodel = require('../models/usersmodel');
const session = require("express-session")
const bcrypt = require('bcrypt');

exports.dashboard = (req, res) => {
    try {
        res.render(path.resolve(__dirname, '../views/dashboard'),{isdriver:req.session.UserType,islogedin:req.session.userid})
    } catch (error) {
        console.log(error)
    }
}
exports.getlogin = (req, res) => {
    try {
        console.log('login get')
        res.render(path.resolve(__dirname, '../views/login'),{isdriver:req.session.UserType,islogedin:req.session.userid})
    } catch (error) {
        console.log(error)
    }
}
exports.postlogin = async (req, res) => {
    try {
        console.log('login post')
        const user = await usersmodel.findOne({ username: req.body.username })
        if (user) {
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
                    res.redirect('/login')
                }
            })
        }else{
            res.redirect('/register')
        }
    } catch (error) {
        console.log(error)
    }
}
exports.getregister = (req, res) => {
    try {
        res.render(path.resolve(__dirname, '../views/register'), { error: null,isdriver:req.session.UserType,islogedin:req.session.userid })
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
            res.render(path.resolve(__dirname, '../views/register'), { error: 'please enter other username',isdriver:req.session.UserType,islogedin:req.session.userid })
        }
        console.log(error)
    }
}
exports.getg2 =async (req, res) => {
    try {
        const user =await usersmodel.findById(req.session.userid)
        res.render(path.resolve(__dirname, '../views/g2'), { isupdated: user.isupdated, userdata: user ,isdriver:req.session.UserType,islogedin:req.session.userid})
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
        req.body.isupdated=true;
        const user = await usersmodel.findByIdAndUpdate(req.session.userid,req.body,{new:true})
        res.render(path.resolve(__dirname, '../views/g2'),{isupdated: user.isupdated, userdata: user,isdriver:req.session.UserType,islogedin:req.session.userid })
    } catch (error) {
        console.log(error)
    }
}
exports.getg =async (req, res) => {
    try {
        const user =await usersmodel.findById(req.session.userid)
        if(!user.isupdated){
           return res.redirect('/g2')
        }
        res.render(path.resolve(__dirname, '../views/g'), { isupdated: user.isupdated, userdata: user ,isdriver:req.session.UserType,islogedin:req.session.userid})
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
        res.render(path.resolve(__dirname, '../views/g'), { userdata: update,isdriver:req.session.UserType,islogedin:req.session.userid})
    } catch (error) {
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