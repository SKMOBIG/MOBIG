module.exports = function(app, connectionPool) {

    app.get('/mappopup', function(req, res) {
        res.render('mappopup', { title: '지도..' });
    });
    
}