var express = require('express.io');
var app = express();
app.http().io();
var path = require('path');
var http = require('http');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var experts = require('./routes/experts');

//require('sockets')(io);

//io.configure(function () {
//    io.set("transports", ["xhr-polling"]);
//    io.set("polling duration", 10);
//});

//io.sockets.on('connection', function (socket) {
//    // Relay chat data to all clients
//  socket.on('editorUpdate', function(data) {
//      socket.broadcast.emit('editorUpdate', data);
//  });
//});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json({
  verify: function(req, res, buf, encoding) {
    req.rawBody = buf.toString();
  }
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/user', users);
app.use('/expert', experts);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// This realtime route will handle the realtime request
app.io.route('editorUpdate', function(req) {
    console.log(req.data);
    req.io.broadcast('editorUpdate', req.data);
});



module.exports = app;
