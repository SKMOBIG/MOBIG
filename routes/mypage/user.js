
module.exports = function(app, connectionPool) {

    app.get('/mypage/user', function(req, res, next) {
        
        /* session 없을 땐 로그인 화면으로 */
        if(!req.session.user_name) {
            res.redirect('/');
        }
    
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
                        
                        res.render('mypage/user', {data : rows[0], session : req.session});
                        connection.release();
                    }else {
                        res.redirect('/');
                        connection.release();
                    }    
                }
            });
        });
    });
    
    app.post('/user', function(req, res, next) {
        /* session 없을 땐 로그인 화면으로 */
        if(!req.session.user_name) {
            res.redirect('/');
            
        }else if(req.session.user_id == req.body.user_id) {
            connectionPool.getConnection(function(err, connection) {
                
                console.log(req.body);
                
                var params = [req.body.phone_number, req.body.birthday, req.body.user_img, req.body.home_town, req.session.user_id];
                var queries = connection.query('update user '+
                                 'set phone_number = ?, birthday = ?, user_img = ?, home_town = ? '+
                                 'where id = ?;', params, function(error, result) {
                    
                    if(error) {
                        connection.release();
                        throw error;
                    }else {
                        connection.release();
                        res.json({success : "Updated Successfully", status : 200, user_img : req.body.user_img}); // express 사용 시
                        /*
                        var response = {
                            status  : 200,
                            success : 'Updated Successfully'
                        }
                        
                        res.end(JSON.stringify(response));
                        */
                    }
                });
            });    
        }
    });
}