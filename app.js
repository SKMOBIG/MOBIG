
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , methodOverride = require('method-override')
  , serveStatic = require('serve-static')
  , errorhandler = require('errorhandler')
  , favicon = require('serve-favicon')
  , morgan = require('morgan')
  , bodyParser = require('body-parser')
  , multer = require('multer') // v1.0.5
  , upload = multer() // for parsing multipart/form-data
  , session = require("express-session")
  ;
  
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
//app.use(favicon(__dirname + '/public/favicon.ico'));
//app.use(morgan());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(methodOverride('X-HTTP-Method-Override'));
//app.use(app.router);
app.use(serveStatic(__dirname + '/public'));
app.use(serveStatic(__dirname + '/semantic'));

// development only 
if ('development' == app.get('env')) {
  app.use(errorhandler());
}

/*
 * db connect pool
 */
var mysql = require('mysql');

var connectionPool = mysql.createPool({
  user : 'admin',
  password : 'happyappdb',
  database : 'mysqldb',
  host : 'b2bdb.ciae2wm5rkuu.us-west-2.rds.amazonaws.com', //port빼고 end-point
  port : '3306',
  connectionLimit : 20,
  waitForConnections : false
});

/*
 *  express-session 모듈 사용
 */
app.use(session({
  secret : 'keyboard cat',
  resave : false,
  saveUninitialized : true
}));

//app.get('/', routes.index);
var index = require('./routes/index')(app, connectionPool);

// main route file 사용
var main = require('./routes/main')(app, connectionPool); // set route file
//app.use('/main', main); // url에 /main 으로 사용

var user = require('./routes/user')(app, connectionPool); // set route file

//hdmain이라는 변수는 /routes/hdmain.js 를 컨트롤 할수 있음
var hdmain = require('./routes/hdmain')(app, connectionPool);

//hdmain이라는 변수는 /routes/hdmain.js 를 컨트롤 할수 있음
var postreg_KJB = require('./routes/postreg_KJB')(app, connectionPool);

var hdregist = require('./routes/hdregist');
app.use('/hdregist', hdregist);

var detail = require('./routes/detail');
app.use('/detail', detail);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;