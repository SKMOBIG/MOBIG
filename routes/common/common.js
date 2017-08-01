module.exports = function common() {

    this.sendMail = function(mailOptions) {
        var nodemailer = require('nodemailer');
        
        // set handlebars
        var hbs = require('nodemailer-express-handlebars');
        var options = {
            viewEngine: {
                extname: '.hbs',
                layoutsDir: 'views/maillayouts/',
                defaultLayout : 'template',
                partialsDir : 'views/maillayouts/partials'
            },
            viewPath: 'views/maillayouts/',
            extName: '.hbs'
        };
        
        // create reusable transporter object using the default SMTP transport
        var transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'test@naver.com',
                pass: '1234'
            }
        });
        
        mailOptions.from = 'test@naver.com';

        transporter.use('compile', hbs(options));
        transporter.sendMail(mailOptions
            , (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
        });
    }
}
// var common = {};
// common.setMileage = setMileage;
// module.exports = common;
