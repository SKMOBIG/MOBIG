module.exports = function(app, connectionPool) {
    
    // /detail 이라는 도메인으로 들어오면 아래 메소드를 실행시키라느 의미
    //app.js에서 app.use('/detail', detail); 를통해 deatil.js를 호출했고, 여기로 연결됨
    /*router.get('/detail', function(req, res, next) {
        //views폴더안에있는 hdmain.ejs를 띄우고, title이라느 이름으로 testing 데이터를 전달하라
        res.render('detail', {
            testing: '값 전달 테스트'
        });
    });*/
    
    /*POST방식은 HTTP HEADER를 통해 데이터를 넘겨주는 방식 */

    
    
    /*GET방식은 URL을 통해 데이터를 넘겨주는 방식 */
    app.get('/detail/:id', function(req, res, next) {
        
        /* session 없을 땐 로그인 화면으로*/
        if(!req.session.user_name) {
            res.redirect('/');
        }
    
        // console.log("session : " + req.session.user_name+" / "+req.session.emp_num);
             connectionPool.getConnection(function(err, connection) {
                connection.query('select hm.happyday_id, hm.happyday_name, hm.happyday_contents, hm.reg_user_id, hm.category_code, DATE_FORMAT(hm.reg_dtm, "%Y-%m-%d") AS reg_dtm, SUBSTR( _UTF8"일월화수목금토", DAYOFWEEK(hm.reg_dtm), 1) AS reg_week, hm.dday_dt, SUBSTR( _UTF8"일월화수목금토", DAYOFWEEK(hm.dday_dt), 1) AS dday_week, DATE_FORMAT(hm.happyday_dt, "%m월 %d일") AS happyday_date, SUBSTR( _UTF8"일월화수목금토", DAYOFWEEK(hm.happyday_dt), 1) AS happyday_week, date_format(hm.happyday_dt,  "%H:%i") AS happyday_time, hm.req_point, hm.cal_point_text, hm.state, hm.ref_url, hm.num_participants, hm.place_name, hm.place_latitude, hm.place_longitude, hm.img_url, u.* from happyday_master hm, user u where hm.reg_user_id = u.id and hm.happyday_id = ?;', req.params.id, function(error, rows) {
                
                // console.log("rows : " + rows.length);
                
                if(error) {
                    connection.release();
                    throw error;
                }else {
                    if(rows.length > 0) {
                        connection.query('select t1.id AS user_id, t1.user_name, t1.phone_number, t1.sm_id from user t1, (select b.happyday_id, b.user_id from happyday_master a, happyday_user_hst b where a.happyday_id = b.happyday_id and b.happyday_id = ? and b.state = "y") t2 where t1.id = t2.user_id;', req.params.id, function(error, rows1){
                            // console.log("haha :" + rows1[0].user_name);
                            if(error){
                                connection.release();
                                throw error;
                            }else {
                                if(rows1.length > 0){
                                    var reg_state = "N";
                                    
                                    for(var i=0; i<rows1.length; i++) {
                                        var cur_user_id = rows1[i].user_id;
                                        if(req.session.user_id == cur_user_id) {
                                            reg_state = "Y";
                                            break;
                                        }
                                    }
                                    
                                    res.render('detail', {data : rows[0], userList : rows1, session : req.session, reg_state : reg_state});
                                    connection.release();
                                }else {
                                    res.redirect('/');
                                    connection.release(); 
                                }
                            }
                        });
                                        
                    }else {
                        res.redirect('/');
                        connection.release();
                    }    
                }
            });
        });
    });

    
    app.post('/infouser', function(req, res, next) {
         connectionPool.getConnection(function(err, connection) {
            connection.query('select user_name, phone_number, sm_id from user where id = ?;', req.body.user_id, function(error, rows) {
                
                console.log("req.params.user_id : " + req.body.user_id);

                if(error) {
                    connection.release();
                    throw error;
                }else {
                    if(rows.length > 0) {

                        res.send({user : rows[0], session : req.session});
                        connection.release();
                    }else {

                    }    
                }
            });
        });
    });
    
    app.post('/applyhappyday', function(req, res, next){
        console.log("들어온다");
        connectionPool.getConnection(function(err, connection) {
            connection.query('insert into happyday_user_hst (user_id, happyday_id, reg_dtm, modify_dtm, use_point, state) values(?, ?, date_format(sysdate(), "%Y%m%d"), null, ?, "y");', [req.session.user_id, req.body.happyday_id, req.body.req_point], function(error, rows){
        
                console.log("req.session.user_id : " + req.session.user_id);
                if(error) {
                    connection.release();
                    throw error;
                }else {
                    res.redirect('/detail/'+ req.body.happyday_id);
                    connection.release();
                }
            });
        });
    });
    
    app.post('/cancelhappyday', function(req, res, next){
        connectionPool.getConnection(function(err, connection) {
            // 테이블 구성 이슈
            // connection.query('update happyday_user_hst set state = "n" where user_id = ? and happyday_id = ? and state = "y";', [req.session.user_id, req.body.happyday_id], function(error, rows){
            connection.query('delete from happyday_user_hst where user_id = ? and happyday_id = ? and state = "y";', [req.session.user_id, req.body.happyday_id], function(error, rows){
        
                console.log("req.session.user_id : " + req.session.user_id);
                if(error) {
                    connection.release();
                    throw error;
                }else {
                    res.redirect('/detail/'+ req.body.happyday_id);
                    connection.release();
                }
            });
        });
    });
    
}
