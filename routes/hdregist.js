
module.exports = function(app, connectionPool) {

    app.get('/hdregist', function(req, res, next) {
        
        // /* session 없을 땐 로그인 화면으로 */
        // if(!req.session.user_name) {
        //     res.redirect('/');
        // }
    
        // console.log("session : " + req.session.user_name+" / "+req.session.emp_num);
        
        connectionPool.getConnection(function(err, connection) {
            connection.query('select * from user where 1=1 and user_name = ? and emp_num = ?;', [req.session.user_name, req.session.emp_num], function(error, rows) {
                
                // console.log("rows : " + rows.length);
                
                if(error) {
                    connection.release();
                    throw error;
                }else {
                    if(rows.length > 0) {
                        res.render('hdregist', {data : rows[0], session : req.session});
                        connection.release();
                    }else {
                        res.redirect('/');
                        connection.release();
                    }    
                }
            });
        });
    });
    
    // app.post('/happyday_regist', function(req, res, next) {
    //     connectionPool.getConnection(function(err, connection) {
    //          // console.log(req.body.dday_dt);
    //         connection.query('insert into happyday_master (happyday_name, happyday_contents, reg_user_id, category_code, reg_dtm, dday_dt, happyday_dt, req_point, state, num_participants, place_name, img_url,point_rsn, update_dtm) values(?,?,?,?,date_format(sysdate(), "%Y%m%d%H%i%s"),?,?,?,"Y",?,?,?,?,date_format(sysdate(), "%Y%m%d%H%i%s"));'
    //                             , [req.body.happyday_name, req.body.happyday_contents, req.session.user_id, req.body.category_code,req.body.dday_dt,req.body.starthappyday, req.body.req_point,req.body.num_participants, req.body.place_name, req.body.img_url, req.body.point_rsn], function(error, rows) {
    //             if(error) {
    //                 connection.release();
    //                 throw error;
    //             }else {
    //                 connection.release();
                   
    //                 res.redirect('/hdregist');
    //             }    
                
    //         });
    //     });
    // });
    

}