const path = require("path");
const express = require('express')
const router = express.Router()

const nodemailer = require('nodemailer')


router.post('/verifycode', function(req, res){
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

module.exports = router