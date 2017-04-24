module.exports = function(app, connectionPool) {
    
    // app.post('/', function(req, res){
  
    // });
    
    app.get('/happyday/detail/:id/postlist', function(req, res, next) {
        
        /* session 없을 땐 로그인 화면으로*/
        if(!req.session.user_name) {
            res.redirect('/');
        }
        
        connectionPool.getConnection(function(err, connection) {
            connection.query('select * from happyday_master a, user b where a.reg_user_id = b.id and a.happyday_id = ?;', req.params.id, function(error, rows) {
                
                if(error) {
                    connection.release();
                    throw error;
                }else {
                    // console.log(rows);
                    if(rows.length > 0) {
                        // console.log(req.params.id);
                        connection.query('select hp.*, hm.*, us.*, concat(left(hp.modify_dtm,4) ,".",substring(hp.modify_dtm,5,2),".",substring(hp.modify_dtm,7,2)) as date, co.org_nm  from happyday_post hp, happyday_master hm, user us, com_org co where hp.happyday_id = ? and hp.happyday_id = hm.happyday_id and hp.user_id = us.id and co.org_id = us.sm_id order by post_id desc;', req.params.id, function(error, rows1) {
                            if(error){
                                connection.release();
                                throw error;
                            }else {
                                if(rows1.length >= 0){
                            
                                    res.render('happyday/postlist', {data : rows[0], postdata : rows1, session : req.session});
                                    connection.release();
                                }else {
                                    // console.log("ee");
                                    res.redirect('/');
                                    connection.release();
                                }
                            }
                        });
                      //  connection.release();                                         
                    }else {
                        res.redirect('/');
                        connection.release();
                    }    
                }
            });
            
        });
  
    });
    /*
    app.post('/postregist_KJB', function(req, res, next) {
       connectionPool.getConnection(function(err, connection) {
        //   console.log("aa"+req.body.happyID);
            connection.query('insert into happyday_post (happyday_id, user_id, post_title, post_content, reg_dtm, modify_dtm, post_count) value( ?,?,?,?, date_format(sysdate(), "%Y%m%d%H%i%s"), date_format(sysdate(), "%Y%m%d%H%i%s"),0);',
            [req.body.happyID,  req.session.user_id, req.body.post_title, req.body.post_content], function(error, rows) 
            {
                if(error) {
                    connection.release();
                    throw error;
                }else 
                {
                        res.redirect('happyday/detail/'+ req.body.happyID+'/postlist');
                        connection.release();
                }
            });
        });
    });
    */
    app.post('/postregist_KJB', function(req, res, next) {
       connectionPool.getConnection(function(err, connection) {
        //   console.log("aa"+req.body.happyID);
            connection.beginTransaction(function(err) {
                if(err) {
                    connection.release();
                    throw err;
                }
                
                connection.query('insert into happyday_post (happyday_id, user_id, post_title, post_content, reg_dtm, modify_dtm, post_count) value( ?,?,?,?, date_format(sysdate(), "%Y%m%d%H%i%s"), date_format(sysdate(), "%Y%m%d%H%i%s"),0);',
                [req.body.happyID,  req.session.user_id, req.body.post_title, req.body.post_content], function(error, rows) {
                    if(error) {
                        console.log("ERROR!!!!!!!!!");
                        
                        connection.rollback(function() {
                            connection.release();
                            console.error("insert happyday_post rollback error");
                            throw error;
                        });
                    }//error
                    
                    console.log("RESULT : " + rows.affectedRows);
                    
                    if(rows.affectedRows > 0) {
                        connection.commit(function(err) {
                            if(err) {
                                console.error("insert happyday_post commit error : " + err);
                                connection.rollback(function() {
                                    connection.release();
                                    console.error("insert happyday_post rollback error");
                                    throw error;
                                });
                            }
                            res.redirect('happyday/detail/'+ req.body.happyID+'/postlist');
                        });
                    }else {
                    
                    }
                    
                    connection.release();
                });
            });    
        });
    });
    
    /*
    app.post('/postgetdata_KJB', function(req, res, next) {
         connectionPool.getConnection(function(err, connection) {
            //  console.log(req.body.happyID);
            //  console.log(req.body.postid);
            connection.query('select hp.*, us.*, co.org_nm from happyday_post hp, user us, com_org co where hp.happyday_id = ? and hp.post_id = ? and hp.user_id = us.id and us.sm_id=co.org_id;', [req.body.happyID, req.body.postid], function(error, rows) {
                if(error) {
                    connection.release();
                    throw error;
                }else {
                    if(rows.length > 0) {
                        //view count update +1
                        connection.query('update happyday_post set post_count = post_count +1 where post_id = ?;', req.body.postid, function(error, rows1) {
                            if(error){
                                connection.release();
                                throw error;
                            }else {
                                    res.send({datas : rows[0], session : req.session});
                                    connection.release();
                            }
                        });
                        
                        
                    }else {

                    }    
                }
            });
        });
    });
    */
    app.post('/postgetdata_KJB', function(req, res, next) {
         connectionPool.getConnection(function(err, connection) {
            //  console.log(req.body.happyID);
            //  console.log(req.body.postid);
            //beginTransaction의 위치가 select조회 후 rows.length > 0 로 들어오고 나서인가...???
            connection.beginTransaction(function(err) {
                if(err) {
                    connection.release();
                    throw err;
                }
                
                connection.query('select hp.*, us.*, co.org_nm from happyday_post hp, user us, com_org co where hp.happyday_id = ? and hp.post_id = ? and hp.user_id = us.id and us.sm_id=co.org_id;', [req.body.happyID, req.body.postid], function(error, rows) {
                    if(error) {
                        console.log("select ERROR!!!!!!!!!");
                        connection.rollback(function() {
                            connection.release();
                            console.error("select rollback error");
                            throw error;
                        });
                        connection.release();
                        throw error;
                    }else {
                        if(rows.length > 0) {
                            //view count update +1
                            connection.query('update happyday_ost set post_count = post_count +1 where post_id = ?;', req.body.postid, function(error, rows1) {
                                if(error){
                                    console.log("update happyday_ost ERROR!!!!!!!!!");
                                    connection.rollback(function() {
                                        connection.release();
                                        console.error("update happyday_ost rollback error");
                                        throw error;
                                    });
                                    connection.release();
                                    throw error;
                                }
                                console.log("RESULT : " + rows1.affectedRows);
                        
                                if(rows1.affectedRows > 0) {
                                    connection.commit(function(err) {
                                        if(err) {
                                            console.error("update happyday_ost commit error : " + err);
                                            connection.rollback(function() {
                                                connection.release();
                                                console.error("update happyday_ost rollback error");
                                                throw error;
                                            });
                                        }
                                        res.send({datas : rows[0], session : req.session});
                                    });
                                }else {  
                                       
                                }
                                 connection.release();
                            });   
                        }else {
    
                        }    
                    }
                });    
            });
        });
    });
    
    /*
    app.post('/postupdate_KJB', function(req, res, next) {
        connectionPool.getConnection(function(err, connection) {
            connection.query('update happyday_post set post_title = ?, post_content=?, modify_dtm = date_format(sysdate(), "%Y%m%d%H%i%s") where post_id = ?;',    
            [req.body.post_title, req.body.post_content, req.body.postid], function(error, rows) 
            {
        
                if(error) {
                    connection.release();
                    throw error;
                }else 
                {
                         res.redirect('happyday/detail/'+ req.body.happyID+'/postlist');
                        connection.release();
                }
            });
        });
    });
    */
    app.post('/postupdate_KJB', function(req, res, next) {
        connectionPool.getConnection(function(err, connection) {
            
            connection.beginTransaction(function(err) {
                if(err) {
                    connection.release();
                    throw err;
                }
                connection.query('update happyday_post set post_title = ?, post_content=?, modify_dtm = date_format(sysdate(), "%Y%m%d%H%i%s") where post_id = ?;',    
                [req.body.post_title, req.body.post_content, req.body.postid], function(error, rows) {
            
                    if(error) {
                        console.log("update happyday_post ERROR!!!!!!!!!");
                        
                        connection.rollback(function() {
                            connection.release();
                            console.error("update happyday_post rollback error");
                            throw error;
                        });
                        connection.release();
                        throw error;
                    }//error
                    
                    console.log("RESULT : " + rows.affectedRows);
                    
                    if(rows.affectedRows > 0) {
                        connection.commit(function(err) {
                            if(err) {
                                console.error("update happyday_post commit error : " + err);
                                connection.rollback(function() {
                                    connection.release();
                                    console.error("update happyday_post rollback error");
                                    throw error;
                                });
                            }
                           res.redirect('happyday/detail/'+ req.body.happyID+'/postlist');
                        });
                    }else {
                       
                    }
                    connection.release();
                });
            });
        });
    });
    
    /*
    app.post('/postdel_KJB', function(req, res, next) {
        
        
       connectionPool.getConnection(function(err, connection) {
            connection.query('delete from happyday_post where post_id=? ;',
            [req.body.postid], function(error, rows) 
            {
        
                if(error) {
        
                    connection.release();
                    throw error;
                }else 
                {
        
                        res.redirect('/detail/'+ req.body.happyID+'/postlist');
                        connection.release();
                }
            });
        });
    });
    */
    app.post('/postdel_KJB', function(req, res, next) {
        connectionPool.getConnection(function(err, connection) {
            
            connection.beginTransaction(function(err) {
                if(err) {
                    connection.release();
                    throw err;
                }
                connection.query('delete from happyday_post where post_id=? ;',
                [req.body.postid], function(error, rows) 
                {
            
                    if(error) {
                        console.log("delete ERROR!!!!!!!!!");
                            
                        connection.rollback(function() {
                            connection.release();
                            console.error("delete happyday_post rollback error");
                            throw error;
                        });
                        connection.release();
                        throw error;
                    }//error
                    
                    console.log("RESULT : " + rows.affectedRows);
                        
                    if(rows.affectedRows > 0) {
                        connection.commit(function(err) {
                            if(err) {
                                console.error("delete happyday_post commit error : " + err);
                                connection.rollback(function() {
                                    connection.release();
                                    console.error("delete happyday_post rollback error");
                                    throw error;
                                });
                            }
                            
                            res.redirect('happyday/detail/'+ req.body.happyID+'/postlist');
                        });
                    }else {
                       
                    }
                    connection.release();
                });
            });
        });
    });
    
}