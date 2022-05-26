if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express');
const session = require('express-session');
const router = express.Router();
const bodyParser = require('body-parser')
const passport = require('passport')
const bcrypt = require('bcrypt')
router.use(bodyParser.json())
router.use(express.urlencoded({ extended: false }))

const Employee = require('../models/employee')
const { check, validationResult } = require('express-validator');
const User = require('../models/user')

const { initializingPassport } = require('../passport-config');
initializingPassport(passport)
router.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}))
router.use(passport.initialize())
router.use(passport.session())

const fileUpload = require('express-fileupload')
const path = require('path')
router.use(express.static('public'))
router.use(fileUpload())

router.use(function (req, res, next) {
  res.locals.isAuthenticated = req.isAuthenticated()
  next()
})

//Get Employee List

router.get('/', checkAuthenticated, async (req, res) => {
  const employees = await Employee.find({});
  res.render('employees/list', {
    'title': 'Employee List',
    'employees': employees,
    'user': req.user.name
  })
});

// Create Employee Form

router.get('/new', checkAuthenticated, (req, res) => {
  res.render('employees/create', {
    'title': 'Add New Employee',
    'user': req.user.name
  })
})

// Store New Employee

router.post('/store', checkAuthenticated, (req, res) => {
  if (!req.files) {
    return res.status(400).send("No files were uploaded.");
  }
  const photo = req.files.photo
  photo.mv(path.resolve(__dirname, '..', 'public/images', photo.name), (error) => {
    Employee.create({
      name: req.body.name,
      email: req.body.email,
      salary: req.body.salary,
      created_by: req.user.name,
      photo: `/images/${photo.name}`
    }, (error, post) => {
      res.redirect("/");
    });
  })
})

// Edit Employee Records  

router.get('/edit/:id', checkAuthenticated, async (req, res) => {
  const employee = await Employee.findById(req.params.id)
  res.render('employees/edit', {
    'title': 'Edit Employee',
    'employee': employee,
    'user': req.user.name
  })
});

// Update Employee Records

router.post('/update/:id', async (req, res) => {
  if (!req.files) {
    await Employee.findByIdAndUpdate(req.params.id, {
      'name': req.body.name,
      'email': req.body.email,
      'salary': req.body.salary,
      'photo': req.body.hidden_photo,
      'created_by': req.user.name
    });
    return res.redirect('/')
  }

  const photo = req.files.photo
  photo.mv(path.resolve(__dirname, '..', 'public/images', photo.name), (error) => {
    Employee.findByIdAndUpdate(req.params.id, {
      ...req.body,
      created_by: req.user.name,
      photo: `/images/${photo.name}`
    }, (error, post) => {
      res.redirect('/');
    });
  })
});

// Delete Employee Records

router.get('/delete/:empId', checkAuthenticated, async (req, res) => {
  await Employee.findByIdAndDelete(req.params.empId, (err, data) => {
    if (err) {
      console.log(err)
    }
    else {
      res.redirect('/')
    }
  }).clone().catch(function (err) { console.log(err) })
})

// Search Employee Records

router.post('/search/', async (req, res) => {
  const employees = await Employee.find({ $or: [{ name: { $regex: '.*' + req.body.search + '.*' } }, { email: { $regex: '.*' + req.body.search + '.*' } }, { salary: req.body.search }] })
  res.render('employees/list', {
    'title': 'Employee List',
    'employees': employees,
    'user': req.user.name
  })
})

// Auth Routes

router.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('users/register', {
    'title': 'Register User',
  })
});

router.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email })

    if (user) return res.status(400).send('User Already Exist')

    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 10)
    })

    res.redirect('/login')

  } catch (error) {
    res.status(404).send(error)
  }
})

router.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('users/login', {
    'title': 'Login User'
  })
})
router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/register',
  failureFlash: false
}))

router.post('/logout', (req, res) => {
  req.logOut();
  req.session.destroy();
  res.redirect('/login');
})

//current User
router.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
})

// Middleware
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

// Check if user Not Authenticated
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}


module.exports = router;