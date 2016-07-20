var UserSession          = require('../models/user_session');
var moment = require('moment');

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/');
}
var h = require('../helpers/app_helpers')
module.exports = function(app, passport){

  app.get('/', function(req, res) {
    res.render('index.jade'); // load the index.jade file
  });

  // =====================================
  // LOGIN ===============================
  // =====================================
  // show the login form
  app.get('/login', function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render('login.jade', { message: req.flash('loginMessage') }); 
  });

  // process the login form
  // app.post('/login', do all our passport stuff here);

  // =====================================
  // SIGNUP ==============================
  // =====================================
  // show the signup form
  app.get('/signup', function(req, res) {

    // render the page and pass in any flash data if it exists
    res.render('signup.jade', { message: req.flash('signupMessage') });
  });

  // process the signup form
  // app.post('/signup', do all our passport stuff here);

  // =====================================
  // PROFILE SECTION =====================
  // =====================================
  // we will want this protected so you have to be logged in to visit
  // we will use route middleware to verify this (the isLoggedIn function)
  app.get('/profile', isLoggedIn, function(req, res) {

    res.render('profile.jade', {
      user : req.user // get the user out of session and pass to template
    });
  });

  // =====================================
  // LOGOUT ==============================
  // =====================================
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  app.get("/generateSession/:user_id", function(req, res){
    // if there is no user with that email
    // create the user
    var newSession            = new UserSession();
    var currentDate           = parseInt(moment(new Date()).utc().add(2, "m").format("x"));


    // set the user's local credentials
    newSession.expires_on  = currentDate;
    newSession.token = newSession.generateHash("helloworld"+currentDate); // this will be system generated

    // save the user
    newSession.save(function(err) {
      if (err)
        return res.status(500).send(newSession.errors);

      var token = JSON.stringify({
        id: newSession._id,
        expires_on: newSession.expires_on,
        password: newSession.token,
        user_id: req.params.user_id
      })
      return res.status(200).send({ success: true, token: h.encrypt(token) });
    });

  })
  app.get("/verify/:token", function(req, res){
    var token = req.params.token;

    var obj = JSON.parse(h.decrypt(token));
    UserSession.findOne({ '_id' :  obj.id }, function(err, user_session) {
      // if there are any errors, return the error before anything else
      if (err)
        return res.status(500).send({ error: "Internal error" });

      // if no user is found, return the message
      if (!user_session)
        return res.status(500).send({ error: "Internal error" });

      // if the user is found but the password is wrong
      if (!user_session.validateToken(obj.password))
        return res.status(401).send({ error: "Not authorised" });

      // all is well, return successful user
      return res.status(200).send({ success: true, user_id: user_session.user_id });
    });


  })
}
