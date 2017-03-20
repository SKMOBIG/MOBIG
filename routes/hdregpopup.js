
module.exports = function(app, connectionPool) {

    app.get('/hdregpopup', function(req, res) {
        
        connectionPool.getConnection(function(err, connection) {
            connection.query('select * from user where 1=1 and user_name = ? and emp_num = ?;', [req.session.user_name, req.session.emp_num], function(error, rows) {
                
                // console.log("rows : " + rows.length);
                
                if(error) {
                    connection.release();
                    throw error;
                }else {
                    if(rows.length > 0) {
                        res.render('hdregpopup', {data : rows[0], session : req.session});
                        connection.release();
                    }else {
                        res.redirect('/');
                        connection.release();
                    }    
                }
            });
        });
        
        
    });
    app.post('/happyday_regist', function(req, res, next) {
        connectionPool.getConnection(function(err, connection) {
            
            //해피데이 마스터 테이블 insert
            connection.query('insert into happyday_master (happyday_name, happyday_contents, reg_user_id, category_code, reg_dtm, dday_dt, happyday_dt, req_point, state, num_participants, place_name, place_latitude, img_url,point_rsn, update_dtm, place_longitude) values(?,?,?,?,date_format(sysdate(), "%Y%m%d%H%i%s"),?,?,?,"Y",?,?,?,?,?,date_format(sysdate(), "%Y%m%d%H%i%s"),?);'
                        , [req.body.happyday_name, req.body.happyday_contents, req.session.user_id, req.body.category_code,req.body.HappyDDay, req.body.starthappyday, req.body.req_point,req.body.num_participants, req.body.place_name, req.body.place_latitude, req.body.img_url, req.body.point_rsn, req.body.place_longitude], function(error, rows) {
                if(error) {
                    connection.release();
                    throw error;
                }else {
                    
                    //happyday-user 테이블 insert
                   
                   connection.query('insert into happyday_user_hst(user_id, happyday_id, reg_dtm, use_point,state) select reg_user_id, happyday_id, date_format(sysdate(),"%Y%m%d%H%i%s") as reg_dtm , req_point , "y" as state from happyday_master where happyday_id = (select max(happyday_id) from happyday_master);', req.body.postid, function(error, rows1) {
                            if(error){
                                connection.release();
                                throw error;
                            }else {
                                    
                                    //TODO : user테이블에서 point 차감
                                  connection.query('update user set happy_point = happy_point - ? where id = ?;',[req.body.req_point, req.session.user_id], function(error, rows1) {
                                    
                                    if(error){
                                    
                                          connection.release();
                                         throw error;
                                     }else {
                                    
                                             connection.release();
                                             res.redirect('/hdmain');
                                         }
                                     });
                            }
                        });
                    
                }    
                
            });
        });
    });
}