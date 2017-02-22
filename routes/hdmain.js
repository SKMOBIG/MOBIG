
module.exports = function(app, connectionPool) {

    app.get('/hdmain', function(req, res, next) {
        
        res.render('hdmain', {data : 'testing'});

    });
}