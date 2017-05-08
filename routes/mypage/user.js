
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
            // console.log(req.body);
            connectionPool.getConnection(function(err, connection) {
                
                connection.beginTransaction(function(err) {
                    if(err) {
                        connection.release();
                        throw err;
                    }
                    
                    var params = [req.body.phone_number, req.body.birthday, req.body.user_img, req.body.home_town, req.session.user_id];
                    connection.query('update user '+
                                        'set phone_number = ?, birthday = ?, user_img = ?, home_town = ? '+
                                      'where id = ?;', params, function(error, result) {
                        if(error) {
                            console.log("ERROR!!!!!!!!!");
                            
                            connection.rollback(function() {
                                connection.release();
                                console.error("update user rollback error");
                                throw error;
                            });
                            connection.release();
                            throw error;
                        } // error
                        
                        console.log("RESULT : " + result.affectedRows);
                        
                        if(result.affectedRows > 0) {
                            connection.commit(function(err) {
                                if(err) {
                                    console.error("update user commit error : " + err);
                                    connection.rollback(function() {
                                        connection.release();
                                        console.error("update user rollback error");
                                        throw error;
                                    });
                                }
                                
                                res.json({success : "Updated Success", status : 200, user_img : req.body.user_img}); // express 사용 시
                            });
                        }else {
                            res.json({success : "Updated fail", status : 500}); // express 사용 시
                        }
                        
                        connection.release();
                    });
                });
                
                
            });    
        }
    });
    
}