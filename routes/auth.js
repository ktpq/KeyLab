const path = require("path");
const express = require('express')
const router = express.Router()
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

async function openDb() {
    return open({
        filename: 'keylabs.db',
        driver: sqlite3.Database
    });
}

const nodemailer = require('nodemailer')


router.post('/sendcode', function(req, res){
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
        html: `TEST verification code : ${verifyCode}`
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
            req.session.email = email
            req.session.password = verifyCode
            req.session.cookie.maxAge=300000
            console.log('Send: ' + info.response)
            return res.redirect('/enterCode');
        }
    })
    
});
router.post('/enterCode', async function (req, res) {
    try {
        const db = await openDb(); // เปิด database
        const code = req.body.ncode;
        const email = req.session.email;
        const pass = req.session.password;
        if (String(code).trim() !== String(pass).trim()) {
            return res.status(401).send('Login failed! Invalid email or password.');
        }
        
        // 🔍 เช็คว่า email มีอยู่ในระบบหรือไม่
        const checkMail = "SELECT * FROM Users WHERE email = ?";
        const row = await db.get(checkMail, [email]);

        if (row) {
            // ✅ ถ้ามี email อยู่แล้ว ให้ล็อกอิน
            console.log("User logged in:", row.email);
            req.session.userId = row.user_id; // เก็บ user ID ไว้ใน session
            return res.redirect('/'); // Redirect to home page
        }

        // ✅ ถ้าไม่มี email ให้สร้างบัญชีใหม่
        const sql = "INSERT INTO Users (email, address) VALUES (?, ?)";
        const result = await db.run(sql, [email, null]);

        // ✅ บันทึก user ID ใน session
        req.session.userId = result.lastID;
        console.log("New user created:", email);

        return res.redirect('/'); // Redirect to home page
    } catch (err) {
        console.error("Database error:", err.message);
        return res.status(500).json({ error: "Database error" });
    }
});

module.exports = router;
