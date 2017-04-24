
module.exports = function(app, connectionPool) {
    app.get('/happyday/error', function(req, res, next) {
        
        /* session 없을 땐 로그인 화면으로 */
        if(!req.session.user_name) {
            res.redirect('/');
        }
        console.log("Error page1..");
        res.render('happyday/error', { title: '에러..' });
       
    });
    
    app.post('/error', function(req, res, next) {
       /* session 없을 땐 로그인 화면으로 */
        if(!req.session.user_name) {
            res.redirect('/');
        }
        console.log("Error page2...");
        res.render('happyday/error', { title: '에러..' });
    });
}