const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const User = require('./models/user')

exports.initializingPassport = (passport) => {
  passport.use(new LocalStrategy({
    // Fields to accept
    usernameField: 'email', // default is username, override to accept email
    passwordField: 'password',
    passReqToCallback: true // allows us to access req in the call back
  },async(req,email,password, done) => {
    const user = await User.findOne({email})
    if (user == null) {
      return done(null, false, { message: 'No user with that email' })
    }
    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user)
      } else {
        return done(null, false, { message: 'Password incorrect' })
      }
    } catch (error) {
      return done(error)
    }
  }))
  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id)
      done(null, user)
    } catch (error) {
      done(error, false)
    }
  })
}

