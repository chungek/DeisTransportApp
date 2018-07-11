const
 mongoose = require( 'mongoose' );
 createError = require('http-errors');
 express = require('express');
 path = require('path');
 cookieParser = require('cookie-parser');
 logger = require('morgan');
 bodyParser = require('body-parser');
 util = require("util");
 //used to read JSON file into node.js to ultimately save into mongoose
 fs = require("fs");
 assert = require('assert');
 VanShuttleSchedulesController = require('./controllers/VanShuttleSchedulesController');
 app = express();

console.log('API server listening...');


// here is where we connect to the database!
const mongoDB = process.env.MONGO_URI || 'mongodb://localhost/DeisTransportApp'
mongoose.connect( mongoDB );
const db = mongoose.connection;
mongoose.Promise = global.Promise;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we are connected!")
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//middleware to process the req object and make it more useful!
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// this handles all static routes ...
// so don't name your routes so they conflict with the public folders
app.use(express.static(path.join(__dirname, 'public')));


app.post('/webhook', VanShuttleSchedulesController.check_parameters,
                      VanShuttleSchedulesController.respondToDF);

// app.get('/skills', skillsController.getAllSkills );
// app.post('/saveSkill', skillsController.saveSkill );
// app.post('/deleteSkill', skillsController.deleteSkill );

app.use('/', function(req, res, next) {
  console.log("in / controller")
  res.render('index', { title: 'BranVan App' });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
