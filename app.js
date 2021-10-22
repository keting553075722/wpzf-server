var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fs = require('fs')
var cors = require('cors')
var config = require('./deploy-config/src/config')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/user');
var tubanRouter = require('./routes/tuban');
var uploadRouter = require('./routes/upload');
var statusRouter = require('./routes/status');
var ddLoginRouter = require('./routes/ddLogin');
var taskRouter = require('./routes/task')


var app = express();

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
app.use('/dd', ddLoginRouter);
app.use('/task', taskRouter);

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


global.$workTablesPath = __dirname + config.activeTableRelativePath;
global.$workTables = JSON.parse(fs.readFileSync($workTablesPath).toString());


// 根据表名获取Id
global.getId = (tableName) => {
    return tableName.split('_')[0]
}

global.getInfo = (tableName) => {
    const [Id, year, batch] = tableName.split('_')
    return {Id, year, batch}
}

Array.prototype['pushItem'] = function (item) {
    if (this.includes(item)) return
    this.push(item)
    let Id = getId(item)
    $workTables[Id] = this
    fs.writeFileSync($workTablesPath, JSON.stringify($workTables))
}
Array.prototype['removeItem'] = function (item) {
    if (!this.includes(item)) return
    let index = this.indexOf(item)
    this.splice(index, 1)
    let Id = getId(item)
    $workTables[Id] = this
    fs.writeFileSync($workTablesPath, JSON.stringify($workTables))
}

String.prototype.toBytes = function (encoding) {
    let buff = new Buffer(this, encoding)
    return buff
}


global.$statusObj = {}
global.environmentPRODEV = config.serverEnv
global.environmentPort = config.appPort
global.taskBatchPattern = config.taskBatchPattern
module.exports = app;
