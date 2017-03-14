module.exports = function(app, connectionPool) {

    app.get('/closepopup', function(req, res) {
        res.render('closepopup', { title: '지도..' });
    });
    
}