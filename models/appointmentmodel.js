const mongoose = require('mongoose')
const appintment = new mongoose.Schema({
    Date:{type:Date,require:true},
    Time:String,
    isTimeSlotAvailable:{type:Boolean,default:true}
})
appintment.index({Date:1,Time:1},{unique:true});
module.exports = mongoose.model('appointment',appintment);