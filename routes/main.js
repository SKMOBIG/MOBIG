var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var connection = mysql.createConnection({
  user : 'admin',
  password : 'happyappdb',
  database : 'mysqldb',
  host : 'b2bdb.ciae2wm5rkuu.us-west-2.rds.amazonaws.com', //port빼고 end-point
  port : '3306'
});

router.get('/login', function(req, res, next) {
   connection.query('select * from mysqldb.user where emp_num = ? ;', [req.params.id], function(error, cursor) {
       if(cursor.length > 0) {
           res.json(cursor);
           res.render('main');
       }else {
           res.status(503).json(error);
       }
   }); 
});

module.exports = router;