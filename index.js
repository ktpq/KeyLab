const express = require("express");
const path = require("path");
const nodemailer = require('nodemailer')
const port = 3000;

const app = express();

// ใช้ส่ง form ผ่าน method post
app.use(express.urlencoded({ extended: true }));

// static resources & templating engine
app.use(express.static('public'));
app.set('view engine', 'ejs');

// routing path
app.get('/', function(req, res){
    res.render('app');
});

app.get('/login', function(req, res){
    res.render('login');
});

// เปลี่ยนจาก GET เป็น POST เพื่อรับค่าจาก form
app.post('/verifycode', function(req, res){
    const email = req.body.email;
    const verifyCode = Math.floor(100000 + Math.random() * 900000);
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'keylab123.official@gmail.com',
            pass: 'wsgkqyacqtgufykm'
        }
    })
    const option = {
        from: 'keylab123.official@gmail.com',
        to: `${email}`,
        subject: 'Nodemailer Verification code TEST',
        html: `<p> TEST verification code : ${verifyCode}</p>`
    }

    transporter.sendMail(option, (err,info) =>{
        if (err){
            console.log('error', err)
            return res.status(200).json({
                RespCode: 400,
                RespMessage: 'bad',
                RespError: err
            })
        } else {
            console.log('Send: ' + info.response)
            return res.status(200).json({
                RespCode: 200,
                RespMessage: 'good'
            })
        }
    })
    res.redirect('/login');
});


// Starting the server
app.listen(port, () => {
   console.log(`Server started at http://localhost:${port}`);
});
