const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name:{
        type:"string",
        required:true,
    },
    email:{
        type:"string",
        required:true,
    },
    salary:{
        type:"string",
        required:true,
    },
    photo:{
        type: "string"
    },
    created_by:{type:"string"},
    created:{type:Date, default:Date.now}
})

module.exports = mongoose.model('Employee', employeeSchema);