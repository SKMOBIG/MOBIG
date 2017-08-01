module.exports = function(app, connectionPool) {



    app.get('/etc/etcmain', function(req, res, next) {

        /* session 없을 땐 로그인 화면으로 */
        if (!req.session.user_name) {
            res.redirect('/');

        }

        // console.log("session : " + req.session.user_name + " / " + req.session.emp_num);

        connectionPool.getConnection(function(err, connection) {
            connection.query('select * from datalist;', function(error, rows) {
                if (error) {
                    connection.release();
                    throw error;
                }
                else {
                    if (rows.length >= 0) {
                        res.render('etc/etcmain', { data: rows,session: req.session });
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