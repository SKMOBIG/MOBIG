
module.exports = function(app, connectionPool) {

    app.get('/main', function(req, res, next) {
        
        /* session 없을 땐 로그인 화면으로 */
        if(!req.session.user_name) {
            res.redirect('/');
            
        }
    
        console.log("session : " + req.session.user_name+" / "+req.session.emp_num);
        
        connectionPool.getConnection(function(err, connection) {
            connection.query('select * from mysqldb.user where 1=1 and user_name = ? and emp_num = ?;', [req.session.user_name, req.session.emp_num], function(error, rows) {
                
                console.log("rows : " + rows.length);
                
                if(error) {
                    connection.release();
                    throw error;
                }else {
                    if(rows.length > 0) {
                        res.render('happyday/main', {data : rows[0], session : req.session});
                        connection.release();
                    }else {
                        res.redirect('/');
                        connection.release();
                    }    
                }
            });
        });
    });
}