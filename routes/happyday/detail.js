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
    app.get('/happyday/detail/:id', function(req, res, next) {
        
        /* session 없을 땐 로그인 화면으로*/
        if(!req.session.user_name) {
            res.redirect('/');
        }
    
    
             connectionPool.getConnection(function(err, connection) {
                connection.query('select u.*, hm.happyday_id, hm.happyday_name, hm.happyday_contents, hm.reg_user_id, hm.category_code' + 
                                 ', DATE_FORMAT(hm.reg_dtm, "%Y-%m-%d") AS reg_dtm, SUBSTR( _UTF8"일월화수목금토", DAYOFWEEK(hm.reg_dtm), 1) AS reg_week' + 
                                 ', hm.dday_dt AS dday, DATE_FORMAT(hm.dday_dt, "%Y-%m-%d") AS dday_dt, SUBSTR( _UTF8"일월화수목금토", DAYOFWEEK(hm.dday_dt), 1) AS dday_week' + 
                                 ', substr(happyday_dt,1,8) AS departure_dt, DATE_FORMAT(hm.happyday_dt, "%m월 %d일") AS happyday_date, SUBSTR( _UTF8"일월화수목금토", DAYOFWEEK(hm.happyday_dt), 1) AS happyday_week, date_format(hm.happyday_dt,  "%H:%i") AS happyday_time' + 
                                 ', hm.req_point, hm.cal_point_text, hm.state, hm.ref_url, hm.num_participants, hm.place_name, hm.place_latitude, hm.place_longitude, hm.img_url, hm.point_rsn, hm.category_code, hm.category_code2, hm.category_code3' + 
                                 '  from happyday_master hm, user u where hm.reg_user_id = u.id and hm.happyday_id = ?;', req.params.id, function(error, rows) {
                
                if(error) {
                    connection.release();
                    throw error;
                }else 
                {
                    if(rows.length > 0) 
                    {
                        connection.query('select t1.id AS user_id, t1.user_name, t1.phone_number, (select org_nm from com_org where org_id = t1.sm_id) AS sm_name, t1.user_img, rec_reg_dtm' + 
                                         '  from user t1, (select b.happyday_id, b.user_id, case when b.modify_dtm is null then b.reg_dtm else b.modify_dtm end AS rec_reg_dtm from happyday_master a, happyday_user_hst b where a.happyday_id = b.happyday_id and b.happyday_id = ? and b.state = "y") t2'+ 
                                         ' where t1.id = t2.user_id order by rec_reg_dtm;', req.params.id, function(error, rows1){
                            
                            if(error)
                            {
                                connection.release();
                                throw error;
                            }
                            else 
                            {
                                if(rows1.length > 0)
                                {
                                    var reg_state = "N";
                                    
                                    //이게 무슨 일을 하는 작업일까???
                                    //아 신청 했는지 안했는지 알아보는 거구나..
                                    for(var i=0; i<rows1.length; i++) {
                                        var cur_user_id = rows1[i].user_id;
                                        if(req.session.user_id == cur_user_id) {
                                            reg_state = "Y";
                                            break;
                                        }
                                    }
                                    
                                    //20170412KJB::Happyday_like(해피데이 좋아요) select 쿼리
                                    //TODO : 쿼리 다시 짜기
                                    connection.query('select count(*) as like_cnt from happyday_like where happyday_id = ?;', [req.params.id], function(error, hd_like_rows) {
                                        if(error) {
                                           connection.release();
                                             throw error;
                                         }
                                        else 
                                        {
                                            if(hd_like_rows.length > 0)
                                            {
                                               
                                                var like_state = "N";

                                                //이미 좋아요 누른 사람이 있을 경우
                                                connection.query('select * from happyday_like where happyday_id = ? and user_id = ?;', [req.params.id, req.session.user_id], function(error, hd_like_yn) {
                                                //TODO : 내가 눌렀는지 확인 하는 작업
                                                //TODO : 내가 눌렀으면 누른 state Y return, 아닐경우 N 리턴
                                                    if(hd_like_yn.length > 0) 
                                                    {
                                                        // console.log("cc");
                                                        like_state = "Y";
                                                        res.render('happyday/detail', {data : rows[0], userList : rows1, HD_like : hd_like_rows[0], session : req.session, reg_state : reg_state, like_state : like_state});
                                                        connection.release();
                                                        console.log(like_state);
                                                    }
                                                    //이미 좋아요 누른 사람이 없는경우 ,, (굳이 이렇게 로직을 짜야하나..)
                                                    else 
                                                    {
                                                        like_state = "N";
                                                        res.render('happyday/detail', {data : rows[0], userList : rows1, HD_like : hd_like_rows[0], session : req.session, reg_state : reg_state, like_state : like_state});
                                                        connection.release();
                                                        console.log(like_state);
                                                    }
                                                });
                                            }
                                            else{
                                                res.redirect('/');
                                                connection.release(); 
                                            }
                                        }
                                    });
                                }
                             
                                else {
                                    res.redirect('/');
                                    connection.release(); 
                                }
                            }
                        });
                                        
                    }
                    else 
                    {
                        res.redirect('/');
                        connection.release();
                    }    
                }
            });
        });
    });

    
    app.post('/infouser', function(req, res, next) {
         connectionPool.getConnection(function(err, connection) {
            connection.query('select user_name, phone_number, sm_id, user_img, (select org_nm from com_org where org_id = t1.sm_id) AS sm_name from user t1 where id = ?;', req.body.user_id, function(error, rows) {
                
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
        
        console.log("apply : " + JSON.stringify(req.body));
        
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
                                    1-2. 이력이 있으면 UPDATE state = 'y'infoUser
                                2. User의 포인트 차감
                                3. 해피데이 이력에서 참가자들 정보를 조회하여 리턴
                            */
                            // 1. 해피데이 참가 신청 이력 확인
                            connection.query('select * from happyday_user_hst where user_id = ? and happyday_id = ? and state = "n";', [req.session.user_id, req.body.happyday_id], function(error, rows){
                                if(rows.length == 0){
                                    //1-1. 이력이 없으면 INSERT
                                    connection.query('insert into happyday_user_hst (user_id, happyday_id, reg_dtm, modify_dtm, use_point, state) ' + 
                                                     'values(?, ?, date_format(sysdate(), "%Y%m%d%H%i"), null, ?, "y");', [req.session.user_id, req.body.happyday_id, req.body.req_point], function(error, rows1){
                                        if(error) {
                                            connection.release();
                                            throw error;
                                        }else {
                                            //2. User의 포인트 차감
                                            var new_point = (parseInt(userInfo[0].happy_point) - parseInt(req.body.req_point));
                                            connection.query('update user' +
                                                             '   set happy_point = ? ' +
                                                             ' where id = ?', [new_point, req.session.user_id], function(error, rows2){
                                                if(error) {
                                                    connection.release();
                                                    throw error;
                                                }else {
                                                    //3.참가자 목록 반환
                                                    connection.query('select t1.id AS user_id, t1.user_name, t1.phone_number, (select org_nm from com_org where org_id = t1.sm_id) AS sm_name, t1.user_img, rec_reg_dtm' + 
                                                                     '  from user t1, (select b.happyday_id, b.user_id, case when b.modify_dtm is null then b.reg_dtm else b.modify_dtm end AS rec_reg_dtm from happyday_master a, happyday_user_hst b where a.happyday_id = b.happyday_id and b.happyday_id = ? and b.state = "y") t2'+ 
                                                                     ' where t1.id = t2.user_id order by rec_reg_dtm;', req.body.happyday_id, function(error, rows3){
                                                        // console.log("haha :" + rows1[0].user_name);
                                                        if(error){
                                                            connection.release();
                                                            throw error;
                                                        }else {
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
                                              
                                }else {
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
                                            connection.query('update user' +
                                                             '   set happy_point = ? ' +
                                                             ' where id = ?;', [new_point, req.session.user_id], function(error, rows2){
                                                if(error) {
                                                    connection.release();
                                                    throw error;
                                                }else {
                                                    //3.참가자 목록 반환
                                                    connection.query('select t1.id AS user_id, t1.user_name, t1.phone_number, (select org_nm from com_org where org_id = t1.sm_id) AS sm_name, t1.user_img, rec_reg_dtm' + 
                                                                     '  from user t1, (select b.happyday_id, b.user_id, case when b.modify_dtm is null then b.reg_dtm else b.modify_dtm end AS rec_reg_dtm from happyday_master a, happyday_user_hst b where a.happyday_id = b.happyday_id and b.happyday_id = ? and b.state = "y") t2'+ 
                                                                     ' where t1.id = t2.user_id order by rec_reg_dtm;', req.body.happyday_id, function(error, rows3){
                                                        if(error){
                                                            connection.release();
                                                            throw error;
                                                        }else {
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
             
            /* 참가 취소 작업 진행 
                1.이력 상태값 수정 happyday_user_hst UPDATE state = 'y'
                2. User의 포인트 변경
                3. 해피데이 이력에서 참가자들 정보를 조회하여 리턴
            */ 
            // 1.이력 상태값 수정 
            connection.query('update happyday_user_hst' + 
                             '   set state = "n", modify_dtm = date_format(sysdate(), "%Y%m%d%H%i")' + 
                             ' where user_id = ? and happyday_id = ? and state = "y";', [req.session.user_id, req.body.happyday_id], function(error, rows){
            
                console.log("cancel : " + JSON.stringify(req.body));
                if(error) {
                    connection.release();
                    throw error;
                }else {
                    //2. User의 포인트 변경
                    connection.query('update user' +
                                     '   set happy_point = happy_point + ?' +
                                     ' where id = ?;', [req.body.req_point, req.session.user_id], function(error, rows1){
                        if(error) {
                            connection.release();
                            throw error;
                        }else {
                            //3.참가자 목록 반환
                            connection.query('select t1.id AS user_id, t1.user_name, t1.phone_number, (select org_nm from com_org where org_id = t1.sm_id) AS sm_name, t1.user_img, rec_reg_dtm' + 
                                             '  from user t1, (select b.happyday_id, b.user_id, case when b.modify_dtm is null then b.reg_dtm else b.modify_dtm end AS rec_reg_dtm from happyday_master a, happyday_user_hst b where a.happyday_id = b.happyday_id and b.happyday_id = ? and b.state = "y") t2'+ 
                                             ' where t1.id = t2.user_id order by rec_reg_dtm;', req.body.happyday_id, function(error, rows2){
                                if(error){
                                    connection.release();
                                    throw error;
                                }else {
                                    if(rows2.length > 0){
                                        res.json({success : "Successfully", status : 200, userList : rows2, reg_state : "N"});
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
        });
    });

    app.get('/deletehappyday/:happyday_id', function(req, res, next){
        connectionPool.getConnection(function(err, connection) {
            /* 삭제 작업 진행 
                1. 해피데이 참가자 조회
                2. 참가자의 hst state='N' update
                3. 참가자의 user 포인트 반환
                4. 해피데이 master state='N' update
            */
            console.log("delete : " + req.params.happyday_id);
            
            // 1. 해피데이 참가자 조회
            connection.query('select user_id, use_point' +
                             '  from happyday_user_hst' +
                             ' where happyday_id = ? and state = "y"', req.params.happyday_id, function(error, userList) {
                if(error) {
                    connection.release();
                    throw error;
                }else {
                    if(userList.length > 0) {
                        
                        for(var i=0; i<userList.length; i++) {
                            // 2. 참가자의 hst state='N' update
                            connection.query('update happyday_user_hst' + 
                                             '   set state = "n", modify_dtm = date_format(sysdate(), "%Y%m%d%H%i")' + 
                                             ' where user_id = ? and happyday_id = ? and state = "y";', [userList[i].user_id, req.params.happyday_id], function(error, rows){
                                if(error){
                                    connection.release();
                                    throw error;
                                }
                            });
                            // 3. 참가자의 user 포인트 반환             
                            connection.query('update user' + 
                                             '   set happy_point = happy_point + ?' + 
                                             ' where id = ?;', [userList[i].use_point, userList[i].user_id], function(error, rows){
                                if(error){
                                    connection.release();
                                    throw error;
                                }
                            });
                        }
                        
                        // 4. 해피데이 master state='N' update           
                        connection.query('update happyday_master' +
                                         '   set state = "N", update_dtm = date_format(sysdate(), "%Y%m%d%H%i")' +
                                         ' where happyday_id = ?', req.params.happyday_id, function(error, rows) {
                            if(error){
                                connection.release();
                                throw error;
                            }else {
                                res.redirect('happyday/hdmain');
                                connection.release();
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
    
    app.post('/completehappyday', function(req, res, next){
        connectionPool.getConnection(function(err, connection) {
           connection.query('update happyday_master' +
                         '   set state = "C", update_dtm = date_format(sysdate(), "%Y%m%d%H%i")' +
                         ' where happyday_id = ?', req.body.happyday_id, function(error, rows) {
            if(error){
                connection.release();
                throw error;
            }else {
                res.json({success : "Successfully", status : 200});
                connection.release();
            }                     
        });
        }); 
    });
    
    
    //20170412_KJB :: 해피데이 좋아요 Insert Or Delete 쿼리
    app.post('/likeHappyDay', function(req, res, next){
        connectionPool.getConnection(function(err, connection) {
           connection.query('select * from happyday_like where happyday_id = ? and user_id =?;', [req.body.happyday_id,req.session.user_id] , function(error, rows) {
            if(error){
                connection.release();
                throw error;
            }else {
                var like_state = "N";
                //내가 좋아요를 누르지 않은 상태
                //테이블에 insert
                if(rows.length==0)
                {
                    
                    connection.query('insert into happyday_like (happyday_id , user_id , happyday_like_dtm) values(?,?,date_format(sysdate(), "%Y%m%d%H%i%s"));',
                        [req.body.happyday_id,  req.session.user_id], function(error, rows) 
                        {
                            if(error) {
                                connection.release();
                                throw error;
                            }else 
                            {
                                
                                connection.query('select count(*) as like_cnt from happyday_like where happyday_id = ?;', [req.body.happyday_id], function(error, hd_like_rows) {
                                    if(error) {
                                       connection.release();
                                         throw error;
                                     }
                                    else 
                                    {
                                        like_state ="Y";
                                        res.json({success : "Successfully", cur_like_cnt : hd_like_rows[0].like_cnt, like_state : like_state});
                                        connection.release();
                                  }
                                });
                            }
                        });
                    
                }
                //내가 좋아요를 누른 상태 
                //테이블에 delete
                else{
                    connection.query('delete from happyday_like where happyday_id =? and user_id = ?;',
                        [req.body.happyday_id,  req.session.user_id], function(error, rows) 
                        {
                            if(error) {
                                connection.release();
                                throw error;
                            }else 
                            {
                                connection.query('select count(*) as like_cnt from happyday_like where happyday_id = ?;', [req.body.happyday_id], function(error, hd_like_rows) {
                                    if(error) {
                                       connection.release();
                                         throw error;
                                     }
                                    else 
                                    {
                                        like_state ="N";
                                        res.json({success : "Successfully", cur_like_cnt : hd_like_rows[0].like_cnt, like_state : like_state});
                                        connection.release();
                                  }
                                });
                            }
                        });
                }
                
            }                     
        });
        }); 
    });
    
    
    app.get('/incompletehappyday/:happyday_id', function(req, res, next){
        connectionPool.getConnection(function(err, connection) {
            /* 미완료 작업 진행 
                1. 해피데이 참가자 조회
                2. 참가자의 hst state='N' update
                3. 참가자의 user 포인트 반환
                4. 해피데이 master state='I' update
            */
            console.log("delete : " + req.params.happyday_id);
            
            // 1. 해피데이 참가자 조회
            connection.query('select user_id, use_point' +
                             '  from happyday_user_hst' +
                             ' where happyday_id = ? and state = "y"', req.params.happyday_id, function(error, userList) {
                if(error) {
                    connection.release();
                    throw error;
                }else {
                    if(userList.length > 0) {
                        
                        for(var i=0; i<userList.length; i++) {
                            // 2. 참가자의 hst state='N' update
                            /*connection.query('update happyday_user_hst' + 
                                             '   set state = "n", modify_dtm = date_format(sysdate(), "%Y%m%d%H%i")' + 
                                             ' where user_id = ? and happyday_id = ? and state = "y";', [userList[i].user_id, req.params.happyday_id], function(error, rows){
                                if(error){
                                    connection.release();
                                    throw error;
                                }
                            });*/
                            // 3. 참가자의 user 포인트 반환             
                            connection.query('update user' + 
                                             '   set happy_point = happy_point + ?' + 
                                             ' where id = ?;', [userList[i].use_point, userList[i].user_id], function(error, rows){
                                if(error){
                                    connection.release();
                                    throw error;
                                }
                            });
                        }
                        
                        // 4. 해피데이 master state='I' update           
                        connection.query('update happyday_master' +
                                         '   set state = "I", update_dtm = date_format(sysdate(), "%Y%m%d%H%i")' +
                                         ' where happyday_id = ?', req.params.happyday_id, function(error, rows) {
                            if(error){
                                connection.release();
                                throw error;
                            }else {
                                res.redirect('happyday/hdmain');
                                connection.release();
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
}

