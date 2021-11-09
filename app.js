var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var cors = require('cors')
var globalBind = require('./model/global-bind')
var reqIntercept = require('./model/global-intercept')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/user');
var tubanRouter = require('./routes/tuban');
var uploadRouter = require('./routes/upload');
var statusRouter = require('./routes/status');
var ddLoginRouter = require('./routes/zzdLogin');
var taskRouter = require('./routes/task')
var visitorRouter = require('./routes/visitor')
var assetsRouter = require('./routes/assets')


var app = express();

app.use(reqIntercept)

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
// 静态资源服务器地址 用正斜杠 '/'代替
app.use(express.static(path.join(__dirname, 'resources')));

app.use(cors())

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/tuban', tubanRouter);
app.use('/upload', uploadRouter);
app.use('/status', statusRouter);
app.use('/zzd', ddLoginRouter);
app.use('/task', taskRouter);
app.use('/visitor', visitorRouter);
app.use('/assets', assetsRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

globalBind()


module.exports = app;
