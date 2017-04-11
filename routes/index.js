
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
    
    app.post('/login', findUser, (req, res, next) => {
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
                    next(new Error("Couldn't find user: " + error));
                }else {
                    req.user = rows
                    next();
                }
            });
        })
    }
    
};

