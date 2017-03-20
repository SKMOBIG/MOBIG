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
                connection.query('select hm.happyday_id, hm.happyday_name, hm.happyday_contents, hm.reg_user_id, hm.category_code, DATE_FORMAT(hm.reg_dtm, "%Y-%m-%d") AS reg_dtm, SUBSTR( _UTF8"일월화수목금토", DAYOFWEEK(hm.reg_dtm), 1) AS reg_week, hm.dday_dt, SUBSTR( _UTF8"일월화수목금토", DAYOFWEEK(hm.dday_dt), 1) AS dday_week, DATE_FORMAT(hm.happyday_dt, "%m월 %d일") AS happyday_date, SUBSTR( _UTF8"일월화수목금토", DAYOFWEEK(hm.happyday_dt), 1) AS happyday_week, date_format(hm.happyday_dt,  "%H:%i") AS happyday_time, hm.req_point, hm.cal_point_text, hm.state, hm.ref_url, hm.num_participants, hm.place_name, hm.place_latitude, hm.place_longitude, hm.img_url, hm.point_rsn, u.* from happyday_master hm, user u where hm.reg_user_id = u.id and hm.happyday_id = ?;', req.params.id, function(error, rows) {
                
                // console.log("rows : " + rows.length);
                
                if(error) {
                    connection.release();
                    throw error;
                }else {
                    if(rows.length > 0) {
                        connection.query('select t1.id AS user_id, t1.user_name, t1.phone_number, t1.sm_id , rec_reg_dtm from user t1, (select b.happyday_id, b.user_id, case when b.modify_dtm is null then b.reg_dtm else b.modify_dtm end AS rec_reg_dtm from happyday_master a, happyday_user_hst b where a.happyday_id = b.happyday_id and b.happyday_id = ? and b.state = "y") t2 where t1.id = t2.user_id order by rec_reg_dtm;', req.params.id, function(error, rows1){
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
    
    app.get('/checkpoint/:user_id', function(req, res, next) {
       connectionPool.getConnection(function(err, connection) {
           connection.query('select happy_point, mileage' +
                            '  from user' +
                            ' where id = ?', req.body.user_id, function(error, rows) {
                                
                if(error) {
                    connection.release();
                    throw error;
                }else {
                    if(rows.length > 0) {
                        res.json({success : "Successfully", status : 200, happy_point : rows[0].happy_point, mileage : rows[0].mileage});
                        connection.release();
                    }else {
                        connection.release();
                        res.redirect('/');
                    }    
                }
                                });
       }) 
    });
    
    app.post('/applyhappyday', function(req, res, next){
        
        connectionPool.getConnection(function(err, connection) {
            // 1. 잔여 포인트 체크
            connection.query('select happy_point, mileage' +
                                '  from user' +
                                ' where id = ?', req.session.user_id, function(error, userInfo) {
                                    
                if(error) {
                    connection.release();
                    throw error;
                }else {
                    if(userInfo.length > 0) {
                        if(userInfo[0].happy_point < req.body.req_point) {
                            //잔영포인트 부족
                            res.json({success : "Successfully", status : 200, checkpoint : "N"});
                            // res.redirect('/detail/'+ req.body.happyday_id);
                            connection.release();
                        }else {
                            /* 참가 작업 진행 
                                1. 해피데이 참가 신청 이력 확인
                                    1-1. 이력이 없으면 happyday_user_hst INSERT
                                    1-2. 이력이 있으면 UPDATE state = 'y'
                                2. User의 포인트 차감
                                3. 해피데이 이력에서 참가자들 정보를 조회하여 리턴
                            */
                            // 1. 해피데이 참가 신청 이력 확인
                            connection.query('select * from happyday_user_hst where user_id = ? and happyday_id = ? and state = "n";', [req.session.user_id, req.body.happyday_id], function(error, rows){
                                if(rows.length == 0){
                                    //1-1. 이력이 없으면 INSERT
                                    console.log("NOT Exist hst and INSERT");
                                    
                                    connection.query('insert into happyday_user_hst (user_id, happyday_id, reg_dtm, modify_dtm, use_point, state) ' + 
                                                     'values(?, ?, date_format(sysdate(), "%Y%m%d%H%i"), null, ?, "y");', [req.session.user_id, req.body.happyday_id, req.body.req_point], function(error, rows1){
                                        if(error) {
                                            connection.release();
                                            throw error;
                                        }else {
                                            //2. User의 포인트 차감
                                            var new_point = (parseInt(userInfo[0].happy_point) - parseInt(req.body.req_point));
                                            console.log("Use point :" + new_point);
                                            
                                            connection.query('update user' +
                                                             '   set happy_point = ? ' +
                                                             ' where id = ?', [new_point, req.session.user_id], function(error, rows2){
                                                if(error) {
                                                    connection.release();
                                                    throw error;
                                                }else {
                                                    //3.참가자 목록 반환
                                                    connection.query('select t1.id AS user_id, t1.user_name, t1.phone_number, (select org_nm from com_org where org_id = t1.sm_id) AS sm_name, t1.user_img' + 
                                                                     '  from user t1, (select b.happyday_id, b.user_id from happyday_master a, happyday_user_hst b where a.happyday_id = b.happyday_id and b.happyday_id = ? and b.state = "y") t2' + 
                                                                     ' where t1.id = t2.user_id;', req.body.happyday_id, function(error, rows3){
                                                        // console.log("haha :" + rows1[0].user_name);
                                                        if(error){
                                                            connection.release();
                                                            throw error;
                                                        }else {
                                                            if(rows3.length > 0){
                                                                console.log("Select userList : " + JSON.stringify(rows3));
                                                                res.json({success : "Successfully", status : 200, userList : rows3, reg_state : "Y", checkpoint : "Y"});
                                                                connection.release();
                                                            }else {
                                                                res.redirect('/');
                                                                connection.release(); 
                                                            }
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                        
                                    });
                                              
                                }else {
                                    console.log("Exist hst and Update");
                                    
                                    //1-2. 이력이 있으면 UPDATE
                                    connection.query('update happyday_user_hst' + 
                                                     ' set state = "y", modify_dtm = date_format(sysdate(), "%Y%m%d%H%i")' + 
                                                     ' where user_id = ? and happyday_id = ? and state = "n";', [req.session.user_id, req.body.happyday_id], function(error, rows1){
                                        if(error) {
                                            connection.release();
                                            throw error;
                                        }else {
                                            //2. User의 포인트 차감
                                            var new_point = (parseInt(userInfo[0].happy_point) - parseInt(req.body.req_point));
                                            console.log("Use point :" + new_point);
                                            
                                            connection.query('update user' +
                                                             '   set happy_point = ? ' +
                                                             ' where id = ?;', [new_point, req.session.user_id], function(error, rows2){
                                                if(error) {
                                                    connection.release();
                                                    throw error;
                                                }else {
                                                    //3.참가자 목록 반환
                                                    connection.query('select t1.id AS user_id, t1.user_name, t1.phone_number, (select org_nm from com_org where org_id = t1.sm_id) AS sm_name, t1.user_img' + 
                                                                     '  from user t1, (select b.happyday_id, b.user_id from happyday_master a, happyday_user_hst b where a.happyday_id = b.happyday_id and b.happyday_id = ? and b.state = "y") t2' + 
                                                                     ' where t1.id = t2.user_id;', req.body.happyday_id, function(error, rows3){
                                                        // console.log("haha :" + rows1[0].user_name);
                                                        if(error){
                                                            connection.release();
                                                            throw error;
                                                        }else {
                                                            console.log("Select userList : " + JSON.stringify(rows3));
                                                            if(rows3.length > 0){
                                                                res.json({success : "Successfully", status : 200, userList : rows3, reg_state : "Y", checkpoint : "Y"});
                                                                connection.release();
                                                            }else {
                                                                res.redirect('/');
                                                                connection.release(); 
                                                            }
                                                        }
                                                    });
                                                }
                                            });
                                        }                 
                                    });
                                }
                                
                            });
                        }
                    }else {
                        connection.release();
                        res.redirect('/');
                    }
                }
            });
        });
    }); // end app.post


    app.post('/cancelhappyday', function(req, res, next){
        connectionPool.getConnection(function(err, connection) {
             
            connection.query('update happyday_user_hst set state = "n", modify_dtm = date_format(sysdate(), "%Y%m%d%H%i") where user_id = ? and happyday_id = ? and state = "y";', [req.session.user_id, req.body.happyday_id], function(error, rows){
            //connection.query('delete from happyday_user_hst where user_id = ? and happyday_id = ? and state = "y";', [req.session.user_id, req.body.happyday_id], function(error, rows){
        
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

    
    // app.post('/applyhappyday', function(req, res, next){
    //     console.log("들어온다");
    //     connectionPool.getConnection(function(err, connection) {
    //         connection.query('insert into happyday_user_hst (user_id, happyday_id, reg_dtm, modify_dtm, use_point, state) values(?, ?, date_format(sysdate(), "%Y%m%d"), null, ?, "y");', [req.session.user_id, req.body.happyday_id, req.body.req_point], function(error, rows){
        
    //             console.log("req.session.user_id : " + req.session.user_id);
    //             if(error) {
    //                 connection.release();
    //                 throw error;
    //             }else {
    //                 res.redirect('/detail/'+ req.body.happyday_id);
    //                 connection.release();
    //             }
    //         });
    //     });
    // });
    


    
}
