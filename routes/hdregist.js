var express = require('express');
var router = express.Router();

// /hdregist 이라는 도메인으로 들어오면 아래 메소드를 실행시키라느 의미
//app.js에서 app.use('/hdregist', hdregist); 를통해 hdregist.js를 호출했고, 여기로 연결됨
router.get('/list', function(req, res, next) {
    //views폴더안에있는 hdregist.ejs를 띄우고, title이라느 이름으로 testing 데이터를 전달하라
    res.render('hdregist', {
        testing: '값 전달 테스트'
    });
});



module.exports = router;
