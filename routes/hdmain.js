
module.exports = function(app, connectionPool) {


    
        app.get('/hdmain', function(req, res, next) {
        
        /* session 없을 땐 로그인 화면으로 */
        if(!req.session.user_name) {
            res.redirect('/');
            
        }
    
        console.log("session : " + req.session.user_name+" / "+req.session.emp_num);
        
        connectionPool.getConnection(function(err, connection) {
            connection.query('select hm.happyday_id, hm.happyday_name, hm.place_name, hm.reg_user_id, DATE_FORMAT(hm.reg_dtm, "%Y-%m-%d") AS reg_dtm, DATE_FORMAT(hm.happyday_dt, "%m월 %d일") AS happyday_date,SUBSTR( _UTF8"일월화수목금토", DAYOFWEEK(hm.happyday_dt), 1) AS week,date_format(hm.happyday_dt,  "%H:%i") as happy_time, hm.req_point, hm.img_url, u.user_name, u.user_img,hm.num_participants , hm.num_participants-p.curcnt as vacancy from happyday_master hm, user u, ( select hm.happyday_id, count(*) as curcnt from happyday_user_hst hp, happyday_master hm where hm.happyday_id=hp.happyday_id group by hm.happyday_id) p where hm.reg_user_id = u.id and hm.happyday_id = p.happyday_id;',  function(error, rows) {
                if(error) {
                    connection.release();
                    throw error;
                }else {
                    if(rows.length > 0) {
                        
                        
                        res.render('hdmain', {data : rows, session : req.session});
                        connection.release();
                    }else {
                        res.redirect('/');
                        connection.release();
                    }    
                }
            });
        });
    });
    
    
    
    
    
    
    
    
}