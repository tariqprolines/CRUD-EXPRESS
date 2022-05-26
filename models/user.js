const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    'name':{
        type:'string',
        required:true,
    },
    'email':{
        type:'string',
        required:true,
    },
    'password':{
        type:'string',
        required:true,
    },
    'created':{type:Date, default:Date.now},
})

module.exports = mongoose.model('User', userSchema)
