
module.exports = function(app, connectionPool) {
    
    /* GET home page. */
    app.get('/', function(req, res) {
        res.render('index', { title: 'Happy App' });
    });
    
    app.post('/login', function(req, res, next) {
        
        console.log(req.body);
        
        connectionPool.getConnection(function(err, connection) {
            connection.query('select * from user where 1=1 and user_name = ? and emp_num = ?;', [req.body.user_name, req.body.emp_num], function(error, rows) {
                if(error) {
                    connection.release();
                    throw error;
                }else {
                    if(rows.length > 0) {
                        connection.release();
                        
                        /* session 내에 사용자 정보 저장 */
                        
                        req.session.regenerate(function (err) {
                          if(err){
                            console.log(err);
                          } else {
                            req.session.user_name = rows[0].user_name;
                            req.session.emp_num = rows[0].emp_num;
                            req.session.team_id = rows[0].team_id;
                            req.session.sm_id = rows[0].sm_id;
                            req.session.user_id = rows[0].id;

                            res.redirect('/hdmain'); // /main url에서 다시 세션 존재 검사
                          }
                        });
                        
                        //res.render('main', {user_name : rows[0].user_name, emp_num : rows[0].emp_num});
                        
                    }else {
                        connection.release();
                        res.redirect('/');
                    }    
                }
            });
        });
    });
};

