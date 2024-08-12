const usersmodel = require("../models/usersmodel")

exports.auth = (UserType)=> async (req, res, next) => {
    try {
        console.log(req.session.userid)
        const user = await usersmodel.findById(req.session.userid)
        console.log(user)
        if (!user) {
            return res.redirect('/login')
        }
        if (user.UserType != UserType) {
            return res.status(403).send('you are not autherized for this page')
        }
        console.log("auth occure")
        next();
    } catch (error) {
        console.log(error)
        res.status(500).send("An error occure while checking you are login")
    }
}