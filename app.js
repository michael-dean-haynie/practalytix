// set up environment
require('dotenv').config();

// require libraries
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');

// require models
var User = require('./models/user');

var routes = require('./routes');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// database setup
mongoose.connect(process.env.DB_CONNECTION);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// middleware
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  cookie: { maxAge: 1000*60*2},
  secret: 'disbeedahsechuhrseekrett',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db,
    collection: 'session',
  })
}));

// authentication
app.use(function(req, res, next){
  req.session.user_id = '59ab5a6bfb08ce3840636140';

  // login page exempt
  if (req.path === '/login') return next();

  // if session has valid user id, user is logged in.
  if (req.session.user_id){
    User.findById(req.session.user_id)
      .exec(function(err, user){
        if (err) return next(err);
        if (!user){
          return next(new Error('Invalid session state. Try deleting cookies and trying again.'));
        } else {
          return next();
        }
      });

  } else{
    res.redirect('/login');
  }
});

// routes
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
