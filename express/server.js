var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var compress = require('compression');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);
var AV = require('avoscloud-sdk');

// config AV
AV.initialize('W2soq1Vc141dGSO2pSYiwFVX-gzGzoHsz', '29EmBl8KEcyTpQbetUPQ0obs');
var Player = AV.Object.extend('Player');

// config socket.io
io.on('connection', function(socket) {
    console.log('socket.io connected');

    /* message from everyone will be broadcast to others */

    // game start
    socket.on('start', function(message) {
        socket.broadcast.emit('start', message);
    });

    // game stop
    socket.on('stop', function(message) {
        socket.broadcast.emit('stop', message);
    });

    // play join the game
    socket.on('join', function(message) {
        socket.userId = message;
        socket.broadcast.emit('join', message);
    });

    // player leave the game
    socket.on('leave', function(message) {
        socket.broadcast.emit('leave', message);
    });

    // player shake
    socket.on('shake', function(message) {
        socket.broadcast.emit('shake', message);
    });

    // player disconnect
    socket.on('disconnect', function() {
        var userId = socket.userId,
            playerQueryObj = new AV.Query('Player');

        playerQueryObj.get(userId).try(function(player) {
            player.set('userStatus', '');
            player.save();
        });

        socket.broadcast.emit('leave', socket.userId);
    });
});


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(compress());
app.use(express.static(path.join(__dirname, '../dist')));

require('./routes/index.js')(app, io);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


server.listen(3000, function() {
    console.log('listening port 3000');
});

module.exports = app;