
module.exports = function(app, connectionPool) {
    
    // Use the session middleware
    //app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}));
    
    /* GET home page. */
    app.get('/', function(req, res) {
        var sess = req.session
        if(sess.views) {
            res.redirect('/happyday/hdmain'); // /main url에서 다시 세션 존재 검사    
        }else {
            res.render('index', { title: 'Happy App' });    
        }
        
    });
    
    app.post('/login', findUser, makeLoginHst, (req, res, next) => {
        // console.log(req.body);
        
        if(req.user.length > 0) {
            /* session 내에 사용자 정보 저장 */
            
            req.session.regenerate(function (err) {
              if(err){
                console.log(err);
              } else {
                // console.log("index.js : "+ rows[0]);
                req.session.user_name = req.user[0].user_name;
                req.session.emp_num = req.user[0].emp_num;
                req.session.team_id = req.user[0].team_id;
                req.session.sm_id = req.user[0].sm_id;
                req.session.mileage = req.user[0].mileage;
                req.session.user_id = req.user[0].id;
                //KJB
                req.session.happy_point = req.user[0].happy_point;

                res.redirect('happyday/hdmain'); // /main url에서 다시 세션 존재 검사
              }
            });
        }else {
            res.redirect('/');
        }
    });
    
    
    function findUser(req, res, next) {
        connectionPool.getConnection((err, connection) => {
            connection.query('select * from user' +
                             ' where 1=1 and user_name = ? and emp_num = ?;', [req.body.user_name, req.body.emp_num], function(error, rows) {
                if(error) {
                    connection.release();
                    next(new Error("route findUser error: " + error));
                }else {
                    connection.release();
                    req.user = rows;
                    next();
                }
            });
        });
    }
    
    function makeLoginHst(req, res, next) {
        //console.log(req.user);
        connectionPool.getConnection((err, connection) => {
            /*
             * 하루에 한번 로그인 이력 생성(insert)
             * 두번 이상의 경우 최종 로그인 시간 및 횟수만 수정(update)
             */
            connection.query('select * from login_hst' +
                             ' where login_id = ?' +
                             ' and login_dt = date_format(sysdate(), "%Y%m%d");', [req.user[0].id, req.body.emp_num], function(error, rows) {
                if(error) {
                    connection.release();
                    next(new Error("route makeLoginHst error: " + error));
                }else {
                    if(rows.length > 0) {
                        /* 당일 로그인 이력 존재하므로 UPDATE */
                        connection.query('update login_hst' +
                                         '   set login_cnt = login_cnt+1, update_dtm = date_format(sysdate(), "%Y%m%d%H%i%s")' +
                                         ' where login_id = ? and login_dt = date_format(sysdate(), "%Y%m%d");', req.user[0].id, function(error, rows) {
                            if(error) {
                                connection.release();
                                next(new Error("route makeLoginHst update error: " + error));
                            }else {
                                connection.release();
                                next();                            }
                        });
                    }else {
                        /* 당일 로그인 이력이 없으면 INSERT */
                        connection.query('insert into login_hst' +
                                         ' (login_id, reg_dtm, login_dt, login_cnt, update_dtm)' +
                                         ' values' +
                                         ' (?, date_format(sysdate(), "%Y%m%d%H%i%s"), date_format(sysdate(), "%Y%m%d"), 1, date_format(sysdate(), "%Y%m%d%H%i%s"))', req.user[0].id, function(error, rows) {
                            if(error) {
                                connection.release();
                                next(new Error("route makeLoginHst insert error: " + error));
                            }else {
                                /* 첫 로그인 시 마일리지 적립 */
                                var common = new (require('./common/common'))();
                                var result = common.setMileage(req, connection);
                                
                                if(result) {
                                    connection.release();
                                    next(result);
                                }else {
                                    next();    
                                }
                            }
                        });
                    }
                }
            });
        });
    }
  /*  
    function setMileage(req, connection) {
        var path = req.path;
        console.log('req path : ' + path);
             
        connection.query('select * from com_mileage' +
                         ' where route_path = ?;', path, function(error, rows) {
            
            if(error) {
                return new Error("Error in setMileage : " + error);
            }else {
                if(rows.length > 0) {
                    var mileage = rows[0].mileage;
                    var type = rows[0].use_type;
                    
                    if(type=='D') mileage *= -1;
                    
                    console.log('mileage / type : ' + mileage + ' / ' + type);
                    
                    connection.query('update user' +
                                     '   set mileage = mileage +  convert(?, signed)' + 
                                     ' where id = ?;',[mileage, req.user[0].id], function(error, user) {
                        if(error) {
                            return new Error("Error of set User Mileage : " + error);
                        }else { 
                            return;
                        }
                    });
                }else {
                    return;
                }
            }
        });
    } */
    
};
