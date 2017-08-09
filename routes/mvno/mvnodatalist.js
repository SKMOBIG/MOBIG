module.exports = function(app, connectionPool) {

    app.get('/mvno/mvnodatalist/', function(req, res, next) {

        /* session 없을 땐 로그인 화면으로 */
        if (!req.session.user_name) {
            res.redirect('/');
        }

        var user_id = req.session.user_id;
        console.log('/mvno/mvnodatalist/', user_id);

        connectionPool.getConnection(function(err, connection) {
            connection.query('SELECT a.*, b.user_name, (SELECT category_grp_dtl_nm FROM mvno_category_grp_lst WHERE category_grp_dtl_id=a.category_grp_dtl_id1) category_grp_dtl_nm1, \
            (SELECT category_grp_dtl_nm FROM mvno_category_grp_lst WHERE category_grp_dtl_id=a.category_grp_dtl_id2) category_grp_dtl_nm2, \
            (SELECT category_grp_dtl_nm FROM mvno_category_grp_lst WHERE category_grp_dtl_id=a.category_grp_dtl_id3) category_grp_dtl_nm3  \
            FROM mvno_req_data a, user b WHERE a.user_id= 8 AND a.user_id = b.id ORDER BY a.req_id desc;', user_id, function(error, rows) {
                if (error) {
                    connection.release();
                    throw error;
                }
                else {
                    if (rows.length >= 0) {
                        var grpId = new Array(rows.length);
                        var tmp; var year; var month; var day; var hour; var min; var sec;

                        for(var i=0; i<rows.length; i++) {
                            if (rows[i].category_grp_dtl_nm1 != null){grpId[i] = rows[i].category_grp_dtl_nm1;}
                            if (rows[i].category_grp_dtl_nm2 != null){grpId[i] = grpId[i] + ", " + rows[i].category_grp_dtl_nm2;}
                            if (rows[i].category_grp_dtl_nm3 != null){grpId[i] = grpId[i] + ", " + rows[i].category_grp_dtl_nm3;}
                            year = rows[i].req_dtm.substring(0,4);
                            month = rows[i].req_dtm.substring(4,6);
                            day = rows[i].req_dtm.substring(6,8);
                            hour = rows[i].req_dtm.substring(8,10);
                            min = rows[i].req_dtm.substring(10,12);
                            sec = rows[i].req_dtm.substring(12,14);
                            rows[i].req_dtm = year + ". " + month + ". " + day + ". " + hour + ":" + min + ":" + sec;
                        }
                        res.render('mvno/mvnodatalist', { req_list: rows, session: req.session, grpId: grpId });
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