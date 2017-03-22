
module.exports = function(app, connectionPool) {
    
    app.get('/detail/:id/hduppopup', function(req, res, next) {
       
        /* session 없을 땐 로그인 화면으로*/
        if(!req.session.user_name) {
            res.redirect('/');
        }
        
        connectionPool.getConnection(function(err, connection) {
            //connection.query('select * from user where 1=1 and user_name = ? and emp_num = ?;', [req.session.user_name, req.session.emp_num], function(error, rows) {
             console.log("aa");
            // connection.query('select *, concat(left(a.happyday_dt,4),"/",substring(a.happyday_dt,5,2),"/",substring(a.happyday_dt,7,2))as HDstartdtShow,  substring(a.happyday_dt,1,8) as HDstartdtDB, concat(substring(a.happyday_dt,9,2),"시",substring(a.happyday_dt,11,2),"분") as HDstarttimeShow, substring(a.happyday_dt,9,4) as HDstarttimeDB,  concat(left(a.dday_dt,4),"/",substring(a.dday_dt,5,2),"/",substring(a.dday_dt,7,2))as HDddaydtShow,  a.dday_dt as HDddaydtDB, concat(a.category_code,',',a.category_code2,',',a.category_code3) as totalCategory from happyday_master a, user b where a.reg_user_id = b.id and a.happyday_id = ?;', req.params.id, function(error, rows) {
            
            connection.query('select *, concat(left(a.happyday_dt,4),"/",substring(a.happyday_dt,5,2),"/",substring(a.happyday_dt,7,2))as HDstartdtShow,  substring(a.happyday_dt,1,8) as HDstartdtDB, concat(substring(a.happyday_dt,9,2),"시",substring(a.happyday_dt,11,2),"분") as HDstarttimeShow, substring(a.happyday_dt,9,4) as HDstarttimeDB,  concat(left(a.dday_dt,4),"/",substring(a.dday_dt,5,2),"/",substring(a.dday_dt,7,2))as HDddaydtShow,  a.dday_dt as HDddaydtDB from happyday_master a, user b where a.reg_user_id = b.id and a.happyday_id = ?;', req.params.id, function(error, rows) {    
            console.log("bb");
                if(error) {
                    connection.release();
                    throw error;
                }else {
                    if(rows.length > 0) {
                        res.render('hduppopup', {data : rows[0], session : req.session});
                        
                        connection.release();
                    }else {
                        
                        res.redirect('/');
                        connection.release();
                    }    
                }
            });
        });
    });
    


    app.post('/happyday_update', function(req, res, next) {
        
        connectionPool.getConnection(function(err, connection) {
        
            connection.query('update happyday_master set happyday_name = ?, happyday_contents = ?, category_code=?, dday_dt = ?, happyday_dt = ?, req_point =?, num_participants =?, place_name = ?, img_url =?, point_rsn = ?, update_dtm = date_format(sysdate(), "%Y%m%d%H%i%s") where happyday_id = ?;'                       
<<<<<<< HEAD
            , [req.body.happyday_name, req.body.happyday_contents, req.body.category_code, req.body.dday_goto_DB, req.body.startdate_goto_DB, req.body.req_point, req.body.num_participants, req.body.place_name,  req.body.img_url, req.body.point_rsn, req.body.happyID], function(error, rows) {
=======
            , [req.body.happyday_name, req.body.happyday_contents, req.body.category_code, req.body.dday_goto_DB, req.body.starthappydaydatetime, req.body.req_point, req.body.num_participants, req.body.place_name,  req.body.img_url, req.body.point_rsn, req.body.happyID], function(error, rows) {
>>>>>>> 0a1b75761ea70661e9fb9fcf4817f00fccd3f827
                if(error) {
                    connection.release();
                    throw error;
                }else {
                    res.redirect('/detail/'+ req.body.happyID);
                    connection.release();
                }    
                
            });
        });
    });
   
   
   
   
   
   
   
   
}