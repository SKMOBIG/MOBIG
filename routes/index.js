
module.exports = function(app, connectionPool) {
    
    // Use the session middleware
    //app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}));
    
    /* GET home page. */
    app.get('/', function(req, res) {
        var sess = req.session
        // if(sess.views) {
        //     res.redirect('mvno/main'); // /main url에서 다시 세션 존재 검사
        // }else {
        //     res.render('mvno/mvnomain', { title: 'MOBIG' });    
        // }
        
        res.render('index', { title: 'MOBIG', session : req.session });
        
    });
    
    
    app.post('/login', findUser, (req, res, next) => {
        if(req.user.length > 0) {
            /* session 내에 사용자 정보 저장 */
            
            req.session.regenerate(function (err) {
              if(err){
                console.log(err);
              } else {
                req.session.user_name = req.user[0].user_name;
                req.session.emp_num = req.user[0].emp_num;
                req.session.team_id = req.user[0].team_id;
                req.session.sm_id = req.user[0].sm_id;
                req.session.mileage = req.user[0].mileage;
                req.session.user_id = req.user[0].id;
                //KJB
                req.session.happy_point = req.user[0].happy_point;
                
                // res.render('mvno/mvnomain', { title: 'MOBIG', session : req.session });
                res.render('index', { title: 'MOBIG', session : req.session });
                
                console.log("login:" + req.session.user_name);
              }
            });
        }else {
            res.redirect('/');
        }
    });

    
    app.get('/logout', function(req, res, next) {
        console.log("logout:" + req.session.user_name);
        req.session.destroy(function(err){
            // 세션 정보 파괴
            res.redirect('/');
        })
    });


    
    function findUser(req, res, next) {
        connectionPool.getConnection((err, connection) => {
            connection.query('select * from user' +
                             ' where 1=1 and user_name = ? and emp_num = ?;', [req.body.user_name, req.body.emp_num], function(error, rows) {
                if(error) {
                    connection.release();
                    next(new Error("route findUser error: " + error));
                }else {
                    if(rows.length > 0) {
                        connection.release();
                        req.user = rows;    
                        next();
                    }else {
                        next('route');
                    }
                }
            });
        });
    }

    
};
