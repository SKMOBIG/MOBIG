
module.exports = function(app, connectionPool) {

    app.get('/user', function(req, res, next) {
        
        /* session 없을 땐 로그인 화면으로 */
        if(!req.session.user_name) {
            res.redirect('/');
        }
    
        console.log("user page session : " + req.session.user_name+" / "+req.session.emp_num+" / "+req.session.user_id);
        
        connectionPool.getConnection(function(err, connection) {
            connection.query('select u.* '+
                                ', (select org_nm from com_org where org_id = u.team_id) as team_name '+
                                ', (select org_nm from com_org where org_id = u.sm_id) as sm_name '+
                             'from user u '+
                             'where u.id = ?;', req.session.user_id, function(error, rows) {
                
                if(error) {
                    connection.release();
                    throw error;
                }else {
                    if(rows.length > 0) {
                        
                        res.render('user', {data : rows[0], session : req.session});
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