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
    
    app.post('/detail', function(req, res){
  
    });
    
    
    /*GET방식은 URL을 통해 데이터를 넘겨주는 방식 */
    app.get('/detail/:id', function(req, res, next) {
        
        /* session 없을 땐 로그인 화면으로*/
        if(!req.session.user_name) {
            res.redirect('/');
        }
    
        console.log("session : " + req.session.user_name+" / "+req.session.emp_num);
        
        
               
            connectionPool.getConnection(function(err, connection) {
                connection.query('select hm.happyday_id, hm.happyday_name, hm.happyday_contents, hm.reg_user_id, hm.category_code, DATE_FORMAT(hm.reg_dtm, "%Y-%m-%d") AS reg_dtm, SUBSTR( _UTF8"일월화수목금토", DAYOFWEEK(hm.reg_dtm), 1) AS reg_week, hm.dday_dt, SUBSTR( _UTF8"일월화수목금토", DAYOFWEEK(hm.dday_dt), 1) AS dday_week, DATE_FORMAT(hm.happyday_dt, "%m월 %d일") AS happyday_date, SUBSTR( _UTF8"일월화수목금토", DAYOFWEEK(hm.happyday_dt), 1) AS happyday_week, date_format(hm.happyday_dt,  "%H:%i") AS happyday_time, hm.req_point, hm.cal_point_text, hm.state, hm.ref_url, hm.num_participants, hm.place_name, hm.place_gps, hm.img_url, u.*, co.* from happyday_master hm, user u, com_org co where hm.reg_user_id = u.id and u.sm_id = co.org_id and hm.happyday_id = ?;', req.params.id, function(error, rows) {
                
                console.log("rows : " + rows.length);
                
                if(error) {
                    connection.release();
                    throw error;
                }else {
                    if(rows.length > 0) {
                        connection.query('select t1.user_name, t3.org_nm from user t1, (select b.happyday_id, b.user_id from happyday_master a, happyday_user_hst b where a.happyday_id = b.happyday_id and b.happyday_id = ?) t2, com_org t3 where t1.id = t2.user_id and t1.sm_id = t3.org_id;', req.params.id, function(error, rows1){
                            console.log("haha :" + rows1[0].user_name);
                            if(error){
                                connection.release();
                                throw error;
                            }else {
                                if(rows1.length > 0){
                                    res.render('detail', {data : rows[0], data1 : rows1, session : req.session});
                                    connection.release();
                                }else {
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
}
