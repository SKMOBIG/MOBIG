
module.exports = function(app, connectionPool) {
    
    /* GET home page. */
    app.get('/', function(req, res) {
        res.render('index', { title: 'Happy App' });
    });
    
    app.post('/login', function(req, res, next) {
        
        console.log(req.body);
        
        connectionPool.getConnection(function(err, connection) {
            connection.query('select * from mysqldb.user where 1=1 and user_name = ? and emp_num = ?;', [req.body.user_name, req.body.emp_num], function(error, rows) {
                if(error) {
                    connection.release();
                    throw error;
                }else {
                    if(rows.length > 0) {
                        connection.release();
                        res.render('main', {user_name : rows[0].user_name, emp_num : rows[0].emp_num});
                        
                    }else {
                        connection.release();
                        res.redirect('/');
                    }    
                }
            });
        });
    });
};

