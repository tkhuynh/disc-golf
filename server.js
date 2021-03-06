//  set variables and requires
var express = require('express'),
	hbs = require('hbs'),
	mongoose = require('mongoose'),
	bodyParser = require('body-parser'),
	request = require('request'),
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	flash = require('express-flash'),
	// oauth = require('./oauth.js'),
	dotenv = require('dotenv').load(),
	app = express();


//Require models
var User = require('./models/user');
var Course = require('./models/course');

// set express view engine
app.set('view engine', 'hbs');

//enable body-parser to gather data
app.use(bodyParser.urlencoded({
	extended: true
}));

//  set up mongoDB
mongoose.connect(
	process.env.MONGOLAB_URI ||
	process.env.MONGOHQ_URL ||
	'mongodb://localhost/disc_golf_app');

// set express to look in public folder for css and js
app.use(express.static(__dirname + '/public'));

// use partials
hbs.registerPartials(__dirname + '/views/partials');

// tell express to use passport
app.use(cookieParser());

// tell express to use session
app.use(session({
	secret: 'disc_golf_key',
	resave: false,
	saveUninitialized: false
}));

// tell express to save user sessions
app.use(passport.initialize());
app.use(passport.session());

// send flash messages for errors
app.use(flash());

// setup authenticate for user login
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//get year for copyright footer
var currentYear = new Date();
currentYear = currentYear.getFullYear();

// GET route for homepage
app.get('/', function(req, res) {
	res.render('index', {user : req.user , currentYear: currentYear});
});

//GET route for profile
app.get('/profile', function(req, res) {
	if (req.user) {
		res.render('profile', {user : req.user , currentYear: currentYear});
	} else {	
		res.render('profile', {user : req.user , currentYear: currentYear});
	}
});

// GET route for courses
app.get('/courses', function(req, res) {
	var zipCode = req.query.zip;
	var newUrl = {
		url: 'https://api.pdga.com/services/json/course?postal_code=' + zipCode,
		type: "GET",
		headers: {
			'Cookie': process.env.pdgaCookie
		},
	};
	request(newUrl, function(err, courseRes, courseBody) {
		var courseList = JSON.parse(courseBody);
		res.json(courseList);
	});
});


//  GET route for events
app.get('/events', function(req, res) {
	var newUrl = {
		url: 'https://api.pdga.com/services/json/event?state=' + req.query.state,
		headers: {
			'Cookie': process.env.pdgaCookie
		}
	};
	request(newUrl, function(err, eventRes, eventBody) {
		var eventList = JSON.parse(eventBody);
		res.json(eventList);
	});
});

// GET route for login
app.get('/login', function(req, res) {
		if (req.user) {
			res.redirect('/');
		} else {
			res.render('login', { user : req.user, currentYear: currentYear, errorMessage: req.flash('error')});	
		}
});

// Authenticate user
app.post('/login', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true
	})
);

// GET route for signup
app.get('/signup', function(req, res) {
	if (req.user) {
		res.redirect('/');
	} else {
		res.render('signup', { user : req.user, currentYear: currentYear, errorMessage: req.flash('signupError')});
	}
});

// POST route for signup
app.post('/signup', function(req, res) {
	if (req.user) {
		res.redirect('/');
	} else {
		User.register(new User({ username: req.body.username}), req.body.password,
		function(err, newUser) {
			if (err) {
				req.flash('signupError', err.message);
				res.redirect('/signup');
			} else {	
				passport.authenticate('local')(req, res, function() {
					res.redirect('/');
				});
			}
		}
		);
	}
});

//GET route to logout
app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

//  server location
app.listen(process.env.PORT || 3000, function() {
	console.log('server is working');
});