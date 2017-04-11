module.exports = function(app, connectionPool) {

    app.get('/happyday/mappopup', function(req, res) {
        res.render('happyday/mappopup', { title: '지도..' });
    });
    
}