const express = require('express');
const app = express();
app.set('view engine','ejs')
const port = process.env.PORT || 3000;
const mongoose = require('mongoose')
const url = "mongodb://localhost:27017/exhorn";
mongoose.connect(url,{useNewUrlParser:true})
    .then(() => console.log('You are now connected to Mongo!'))
    .catch(err => console.log('something wrong', err))

// const empRouter = require('./routes/employee')
const userRouter = require('./routes/webRoute')

// app.use('/',empRouter);
app.use('/',userRouter);

app.listen(port,() => {console.log(`Server Started at ${port} port`)})