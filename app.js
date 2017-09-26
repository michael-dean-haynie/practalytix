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

// require models
var User = require('./models/user');

var rootRoutes = require('./routes/root');
var authRoutes = require('./routes/auth');
var sessionRoutes = require('./routes/session');
// var webSocketRoutes = require('./routes/web-socket');

var app = express();
var expressWS = require('express-ws')(app);

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
  cookie: { maxAge: 1000*60*2},
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
app.use('/sessions', middleware.authed, sessionRoutes);
// app.use('/web-socket');
// app.ws('/web-socket');
app.ws('/web-socket/live-session', function(ws, req){
  console.log('And THIS is here.');
  ws.on('message', function(msg){
    console.log('This is here');
    console.log(msg);
    ws.send(msg);
  });
});

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
