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
       connectionPool.getConnection(function(err, connection) {
            connection.query('insert into happyday_post (happyday_id, user_id, post_title, post_content, reg_dtm, modify_dtm) value( 1,?,?,?, date_format(sysdate(), "%Y%m%d%H%i%s"), date_format(sysdate(), "%Y%m%d%H%i%s"));',
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
    
    app.post('/postgetdata', function(req, res, next) {
         connectionPool.getConnection(function(err, connection) {
            connection.query('select hp.*, us.user_name from happyday_post hp, user us where hp.happyday_id = ? and hp.post_id = ? and hp.user_id = us.id;', ['1', req.body.postid], function(error, rows) {
                // console.log("rows : " + rows.length);
                 
                if(error) {
                    // console.log("error")
                    connection.release();
                    throw error;
                }else {
                    if(rows.length > 0) {
                        // console.log(" user_name "+rows[0].user_name)
                        res.send({datas : rows[0], session : req.session});
                        connection.release();
                    }else {

                    }    
                }
            });
        });
    });
    
    app.post('/postupdate', function(req, res, next) {
        console.log("들어와라");
         console.log(req.body);
        
        connectionPool.getConnection(function(err, connection) {
            connection.query('update happyday_post set post_title = ?, post_content=?, modify_dtm = date_format(sysdate(), "%Y%m%d%H%i%s") where post_id = ?;',    
            [req.body.post_title, req.body.post_content, 60], function(error, rows) 
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