module.exports = function(app, connectionPool) {
    
    // app.post('/', function(req, res){
  
    // });
    
    app.get('/detail/:id/postlist', function(req, res, next) {
        
        /* session 없을 땐 로그인 화면으로*/
        if(!req.session.user_name) {
            res.redirect('/');
        }
        
         connectionPool.getConnection(function(err, connection) {
            connection.query('select * from happyday_master a, user b, com_org c where 1=1 and a.reg_user_id = b.id and b.sm_id = c.org_id and a.happyday_id = ?;', req.params.id, function(error, rows) {
                
                if(error) {
                    connection.release();
                    throw error;
                }else {
                    // console.log(rows);
                    if(rows.length > 0) {
                        // console.log(req.params.id);
                        connection.query('select hp.*, hm.*, us.*, concat(left(hp.modify_dtm,4) ,".",substring(hp.modify_dtm,5,2),".",substring(hp.modify_dtm,7,2)) as date  from happyday_post hp, happyday_master hm, user us where hp.happyday_id = ? and hp.happyday_id = hm.happyday_id and hp.user_id = us.id order by post_id desc;', req.params.id, function(error, rows1) {
                            
                            if(error){
                            
                                connection.release();
                                throw error;
                            }else {
                                if(rows1.length >= 0){
                            
                                    res.render('postlist', {data : rows[0], postdata : rows1, session : req.session});
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
        
        
        
        //  connectionPool.getConnection(function(err, connection) {
        //     connection.query('select hp.*, hm.*, us.* from happyday_post hp, happyday_master hm, user us where hp.happyday_id = ? and hp.happyday_id = hm.happyday_id and hp.user_id = us.id order by post_id desc;', req.params.id, function(error, rows) {
                
        //         if(error) {
        //             connection.release();
        //             throw error;
        //         }else {
        //             if(rows.length >= 0) {
        //                 res.render('postlist', {data : rows, session : req.session});
        //                 connection.release();                                         
        //             }else {
        //                 res.redirect('/');
        //                 connection.release();
        //             }    
        //         }
        //     });
            
        // });
    });
    
    
    app.post('/postregist_KJB', function(req, res, next) {
        
    
       connectionPool.getConnection(function(err, connection) {
        //   console.log("aa"+req.body.happyID);
            connection.query('insert into happyday_post (happyday_id, user_id, post_title, post_content, reg_dtm, modify_dtm) value( ?,?,?,?, date_format(sysdate(), "%Y%m%d%H%i%s"), date_format(sysdate(), "%Y%m%d%H%i%s"));',
            [req.body.happyID,  req.session.user_id, req.body.post_title, req.body.post_content], function(error, rows) 
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
    
    app.post('/postgetdata_KJB', function(req, res, next) {
         connectionPool.getConnection(function(err, connection) {
            //  console.log(req.body.happyID);
            //  console.log(req.body.postid);
            connection.query('select hp.*, us.user_name from happyday_post hp, user us where hp.happyday_id = ? and hp.post_id = ? and hp.user_id = us.id;', [req.body.happyID, req.body.postid], function(error, rows) {
                if(error) {
                    connection.release();
                    throw error;
                }else {
                    if(rows.length > 0) {
                        
                        res.send({datas : rows[0], session : req.session});
                        connection.release();
                    }else {

                    }    
                }
            });
        });
    });
    
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
                         res.redirect('/detail/'+ req.body.happyID+'/postlist');
                        connection.release();
                }
            });
        });
    });
    
    
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
    
}
