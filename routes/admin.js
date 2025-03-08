const path = require("path");
const express = require('express')
const router = express.Router()
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const { json } = require("stream/consumers");

async function openDb() {
    return open({
        filename: 'keylabs.db',
        driver: sqlite3.Database
    });
}



router.get('/admin', async (req, res) =>{
    const password = req.query.pass;
    if (Number(password) === 1234){
        req.session.admin = true
        res.redirect('/')
    } else {
        res.redirect('/')
    }
})

router.get('/manuser', async (req, res) => {
    if (req.session.admin) {
        try {
            const db = await openDb();
            // ✅ ดึงข้อมูล users + จำนวน order
            const users = await db.all(`
                SELECT Users.*, COUNT(Orders.order_id) AS order_count
                FROM Users
                LEFT JOIN Orders ON Users.user_id = Orders.user_id
                GROUP BY Users.user_id;
            `);

            res.render('manuser', { allUser: users });
        } catch (err) {
            res.send(err.message);
        }
    } else {
        res.redirect('/');
    }
});

router.get('/deleteUser', async (req, res) => {
    try {
        const db = await openDb();
        const id = req.query.id;

        await db.run("DELETE FROM Order_items WHERE order_id IN (SELECT order_id FROM Orders WHERE user_id = ?)", [id]);

        await db.run("DELETE FROM Orders WHERE user_id = ?", [id]);

        await db.run("DELETE FROM Users WHERE user_id = ?", [id]);

        res.redirect('/manuser');
    } catch (err) {
        res.send(err.message);
    }
});


module.exports = router;