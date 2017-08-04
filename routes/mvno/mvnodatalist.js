module.exports = function(app, connectionPool) {

    app.get('/mvno/mvnodatalist/', function(req, res, next) {

        /* session 없을 땐 로그인 화면으로 */
        if (!req.session.user_name) {
            res.redirect('/');
        }

        var req_id = req.params.id;
        console.log('/mvno/mvnodatalist/', req_id);
        
        req_id = 8; // test
        
        connectionPool.getConnection(function(err, connection) {
            connection.query('select * from mvno_req_data where user_id=?;', req_id, function(error, rows) {
                if (error) {
                    connection.release();
                    throw error;
                }
                else {
                    if (rows.length >= 0) {
                        res.render('mvno/mvnodatalist', { req_list: rows, req_id: req_id, session: req.session });
                        connection.release();
                    }
                    else {
                        res.redirect('/');
                        connection.release();
                    }
                }
            });
        });
    });
    
}