module.exports = function(app, connectionPool) {
    app.get('/postreg_KJB', function(req, res, next) {
        /* session 없을 땐 로그인 화면으로 */
        if(!req.session.user_name) {
            res.redirect('/');
        }
        // res.render('postreg_KJB', {data : 'testing'});
        // console.log("session : " + req.session.user_name+" / "+req.session.emp_num);
        connectionPool.getConnection(function(err, connection) {
            connection.query('select * from user where 1=1 and user_name = ? and emp_num = ?;', [req.session.user_name, req.session.emp_num], function(error, rows) {
                // console.log("rows : " + rows.length);
                if(error) {
                    connection.release();
                    throw error;
                }else {
                    if(rows.length > 0) {
                        res.render('postreg_KJB', {data : rows[0], session : req.session});
                        connection.release();
                        // console.log("어디서 에러가 나는거야 ㅠㅠ");
                    }else {
                        res.redirect('/postreg_KJB');
                        connection.release();
                    }    
                }
            });
        });
    });
     app.post('/postregist', function(req, res, next) {
        //  console.log(req.body);
        // console.log(req.session.user_name);
        // console.log("ID :  " + req.session.id);
        // console.log("마일리지 : " + req.session.mileage);
         connectionPool.getConnection(function(err, connection) {
            connection.query('insert into happyday_post (happyday_id, user_id, post_title, post_content, reg_dtm, modify_dtm) value( 1,?,"?","?", date_format(sysdate(), "%Y%m%d%H%i%s"), "99991231235959");',
            // [req.session.user_name, req.body.post_title, req.body.post_content], function(error, rows)
            [req.session.user_id, req.body.post_title, req.body.post_content], function(error, rows) 
            {
                // console.log("rows : " + rows.length);
                if(error) {
                    connection.release();
                    throw error;
                }else 
                {
                        res.redirect('/postreg_KJB');
                        connection.release();
                }
            });
        });
    });
    
    app.post('/postupdate', function(req, res, next) {
        //  console.log(req.body);
        // console.log("ID :  " + req.session.id);
        // console.log("마일리지 : " + req.session.mileage);
        
        connectionPool.getConnection(function(err, connection) {
            connection.query('select * from happyday_post where happyday_id = 1 and post_id =?;',
            [1, req.body.post_id], function(error, rows) 
            {
                // console.log("rows : " + rows.length);
                if(error) {
                    connection.release();
                    throw error;
                }else 
                {
                        res.redirect('/postreg_KJB');
                        connection.release();
                }
            });
        });
    });
}