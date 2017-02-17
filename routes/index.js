
module.exports = function(app, connection) {
    /* GET home page. */
    app.get('/', function(req, res) {
        res.render('index', { title: 'Happy App' });
    });
    
    app.post('/login', function(req, res) {
        
        console.log(req.body);
        
         var user_nm = req.body.user_nm;
         var emp_num = req.body.emp_num;
        res.render('main', { user_nm: 'Happy App' , user_nm: ' oo'});
        // console.log(user_nm + " / " + emp_num);
        
/*        connection.query('select * from mysqldb.user where 1=1;', function(error, cursor) {
            if(cursor != null) {
                res.json(cursor);
                res.render('main');
            }else {
                res.status(503).json(error);
            }
        });*/
    });
};

