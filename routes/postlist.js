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
    
    app.post('/', function(req, res){
  
    });
    
    
    /*GET방식은 URL을 통해 데이터를 넘겨주는 방식 */
    app.get('/detail/:id/postlist', function(req, res, next) {
        
        /* session 없을 땐 로그인 화면으로*/
        if(!req.session.user_name) {
            res.redirect('/');
        }
    
        console.log("session : " + req.session.user_name+" / "+req.session.emp_num);
        
        connectionPool.getConnection(function(err, connection) {
            connection.query('select hp.*, hm.*, us.* from happyday_post hp, happyday_master hm, user us where hp.happyday_id = ? and hp.happyday_id = hm.happyday_id and hp.user_id = us.id;', req.params.id, function(error, rows) {
                
                console.log("rows : " + rows.length);
                
                if(error) {
                    connection.release();
                    throw error;
                }else {
                    if(rows.length > 0) {
                        console.log("req.params : " + req.params);
                        res.render('postlist', {data : rows, data2 : req.params, session : req.session});
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
