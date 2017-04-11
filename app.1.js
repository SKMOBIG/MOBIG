
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
var connectionPool;

/* 운영 DB
connectionPool = mysql.createPool({
  user : 'admin',
  password : 'tobehappy',
  database : 'mysqldb',
  host : 'b2bdb.csrn58xktwkr.ap-northeast-1.rds.amazonaws.com', //port빼고 end-point
  port : '3306',
  connectionLimit : 20,
  waitForConnections : false
});
 */
/* TEST DB */
connectionPool = mysql.createPool({
  user : 'tester',
  password : 'tobehappy',
  database : 'testdb',
  host : 'testb2bdb.csrn58xktwkr.ap-northeast-1.rds.amazonaws.com', //port빼고 end-point
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

var hdregist = require('./routes/hdregist')(app, connectionPool);
var hdupdate = require('./routes/hdupdate')(app, connectionPool);

var hdmain = require('./routes/hdmain')(app, connectionPool);


var postreg_KJB = require('./routes/postreg_KJB')(app, connectionPool);


var hdregist = require('./routes/hdregist');
app.use('/hdregist', hdregist);

var detail = require('./routes/detail')(app, connectionPool);

var postlist = require('./routes/postlist')(app, connectionPool);

var mappopup = require('./routes/mappopup')(app, connectionPool);
var hdregpopup = require('./routes/hdregpopup')(app, connectionPool);
var hduppopup = require('./routes/hduppopup')(app, connectionPool);
var closepopup = require('./routes/closepopup')(app, connectionPool);
  
/*
 *  express-session 모듈 사용
 */
app.use(session({
  secret : 'keyboard cat',
  resave : false,
  saveUninitialized : true
}));


var server = http.createServer(app)

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + ' : '+app.get('port'));
  
  console.log('opened server on', server.address());

});

module.exports = app;