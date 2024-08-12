const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const users = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    UserType: { type: String, enum: ['Driver', 'Examiner', 'Admin'] },
    firstName: { type: String, default: 'demo' },
    lastName: { type: String, default: 'demo' },
    licenseNumber: { type: String, default: 'demo' },
    age: { type: Number, default: '0' },
    dob: { type: Date, default: Date.now },
    AppointmentID:{type:mongoose.Types.ObjectId,ref:'appointment'},
    car_detail: {
        make: { type: String, default: 'demo' },
        model: { type: String, default: 'demo' },
        year: { type: String, default: '0' },
        plateNumber: { type: String, default: 'demo' }
    },
    isupdated:{type:Boolean,required:true,default:false},
    TestType:{type:String,enum:["g2","g"]},
    isTestPassed:{type:Boolean},
    comment:{type:String}
});

users.pre('save', async function (next) {
    try {
        this.licenseNumber = await bcrypt.hash(this.licenseNumber, 10)
        this.password = await bcrypt.hash(this.password, 10)
        this.username = this.username.toLowerCase();
        next()
    } catch (error) {
        console.log(error)
    }
})
users.pre(['updateOne','findOneAndUpdate'], async function (next) {
    try {
        console.log('update pre run')
        this.getUpdate().licenseNumber = await bcrypt.hash(this.getUpdate().licenseNumber, 10)
        next()
    } catch (error) {
        console.log(error)
    }
})

module.exports = mongoose.model('user', users);