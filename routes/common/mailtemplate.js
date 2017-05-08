module.exports = function mailtemplate() {
    this.happydayReg = function(data) {
         // setup email data with unicode symbols
        let mailOptions = {
            from: '2bhappymanager@gmail.com', // sender address
            to: 'ljw82@sk.com', // list of receivers
            subject: '[NEW HAPPYDAY] '+ data.happyday_name, // Subject line
            text: 'NEW HAPPYDAY', // plain text body
            html: '<div style="background-color:#FBBD08 width:700px; height:185px">'+
                  '<img style="display:block; width:700px; height:185px" src="https://b2bhappy.herokuapp.com/images/gnblogo.png"/></div>'+
                  'Embedded image: <img src="cid:mainlogo@happyday.ee"/>'+
                  '<p><h3>안녕하세요~ 신규 해피데이가 등록되었습니다.</h3>'+
                  '   <h3>이번 해피데이의 내용을 간단히 소개하며, 지금 2BHAPPY에 접속하여 참가 신청하세요:D</h3></p>'+
                  '<p><ul>'+
                  '   <li>등록자 : '+data.user_name+'</li>'+
                  '   <li>일  시 : '+data.happyday_dt+'</li>'+
                  '   <li>내  용 : '+data.happyday_contents+'</li>'+
                  '   <li>인원수 : '+data.num_participants+'</li>'+
                  '   <li>포인트 : '+data.req_point+'</li>'+
                  '</ul></p>'+
                  '<p><h4>2BHAPPY URL : '+data.happy_url+'</h4></p>',
            attachments: [{
                filename : 'gnblogo.png',
                path: '../../public/images/',
                cid: 'mainlogo@happyday.ee'}]
        };
        
        return mailOptions;
        
        /* Using swig-email-templates
        var EmailTemplates = require('swig-email-templates');
        var transporter = nodemailer.createTransport('smtps://user%40gmail.com:pass@smtp.gmail.com');
        
        // create template renderer
        var templates = new EmailTemplates();
        
        // provide custom rendering function
        var sendPwdReminder = transporter.templateSender({
            render: function(context, callback){
                templates.render('pwreminder.html', context, function (err, html, text) {
                    if(err){
                        return callback(err);
                    }
                    callback(null, {
                        html: html,
                        text: text
                    });
                });
            }
        });
        ...
        */
    }
}