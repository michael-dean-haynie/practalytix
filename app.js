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
var expressValidator = require('express-validator');
var middleware = require('./middleware');
var navData = require('./view-models/navData');

// require models
var User = require('./models/user');

var rootRoutes = require('./routes/root');
var authRoutes = require('./routes/auth');
var manageAuthRoutes = require('./routes/manageAuth');
var sessionRoutes = require('./routes/session');

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
app.use(expressValidator());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  cookie: { maxAge: 1000*60*60*24}, // 24 hours (in miliseconds)
  secret: 'disbeedahsechuhrseekrett',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db,
    collection: 'cookiesession',
  })
}));

// dev auto signin
app.use(middleware.devAutoSignin);

// determine auth status
app.use(middleware.determineAuth);

// routes
app.use('/', rootRoutes);
app.use('/auth', middleware.noAuth, authRoutes);
app.use('/manage-auth', middleware.authed, manageAuthRoutes);
app.use('/sessions', middleware.authed, sessionRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  res.render('404', {navData: navData.get(res)});
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = err;
  res.status(err.status || 500);
  if (req.app.get('env') === 'development'){
    // render the error page
    res.render('error');
  }
  else{
    // render the 500 page
    res.render('500');
  }
});

module.exports = app;
