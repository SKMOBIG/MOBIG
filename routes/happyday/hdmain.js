module.exports = function(app, connectionPool) {



    app.get('/happyday/hdmain', function(req, res, next) {

        /* session 없을 땐 로그인 화면으로 */
        if (!req.session.user_name) {
            res.redirect('/');

        }

        console.log("session : " + req.session.user_name + " / " + req.session.emp_num);

        connectionPool.getConnection(function(err, connection) {
            connection.query('select hm.happyday_id, hm.happyday_name, hm.state, hm.place_name, hm.reg_user_id,'+
                             '       DATE_FORMAT(hm.reg_dtm, "%Y-%m-%d") AS reg_dtm, DATE_FORMAT(left(hm.happyday_dt,8), "%m월 %d일") AS happyday_date,'+
                             '       SUBSTR( _UTF8"일월화수목금토", DAYOFWEEK(left(hm.happyday_dt,8)), 1) AS week, date_format(hm.happyday_dt,  "%H:%i") as happy_time,'+ 
                             '       hm.req_point, hm.img_url, hm.num_participants, hm.num_participants-p.curcnt as vacancy, (hm.dday_dt-curdate()) as dday,'+ 
                             '       (select org_nm from com_org where org_id = u.team_id) as team_name, (select org_nm from com_org where org_id = u.sm_id) as sm_name,' +
                             '       u.user_name, u.user_img '+
                             '  from happyday_master hm, user u, (select hm.happyday_id, count(*) as curcnt from happyday_user_hst hp, happyday_master hm where hm.happyday_id=hp.happyday_id  and hp.state not in ("N") group by hm.happyday_id) p'+ 
                             ' where hm.reg_user_id = u.id and hm.happyday_id = p.happyday_id' +
                             ' order by reg_dtm;', function(error, rows) {
                if (error) {
                    connection.release();
                    throw error;
                }
                else {
                    if (rows.length >= 0) {
                        res.render('happyday/hdmain', { data: rows,session: req.session });
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





    app.post('/showparticipants', function(req, res, next) {
         connectionPool.getConnection(function(err, connection) {
            connection.query(' select u.user_name, u.user_img,  (select org_nm from com_org where org_id = u.sm_id) as sm_name from happyday_user_hst hp, user u where u.id = hp.user_id and hp.state="y" and hp.happyday_id=?;  ', [req.body.happyday_id], function(error, rows) {
                if(error) {
                    connection.release();
                    throw error;
                }else {
                    if(rows.length > 0) {
                        var peoplelist='';  
                        for(var i=0; i<rows.length; i++){
                            peoplelist+="<div class='four wide column'><img class='ui small circular image' src='"+rows[i].user_img+"' style='width:150px  !important; height:150px !important; '><h6 class='content' style='text-align:center'>"+rows[i].user_name +"<br>("+ rows[i].sm_name+")</h5></div>";
                        }
 
                        res.send({peoplelist : peoplelist, session : req.session});
                        connection.release();
                    }else {

                    }    
                }
            });
        });
    });


}