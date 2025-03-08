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

router.get('/confirmOrder', async function(req, res) {
    const db = await openDb();
    const data = JSON.parse(decodeURIComponent(req.query.data));
    console.log(data);

    let orderPrice = 0;
    const today = new Date().toISOString().split('T')[0];

    data.forEach(element => {
        orderPrice += Number(element.totalPrice);
    });

    const orderSql = "INSERT INTO Orders(user_id, order_date, total_price) VALUES (?, ?, ?);";
    const orderItemSql = "INSERT INTO Order_items(order_id, prod_id, quantity, price) VALUES (?, ?, ?, ?);";

    try {
        const result = await db.run(orderSql, [req.session.userId, today, orderPrice]);
        const orderId = result.lastID;

        console.log("New Order ID:", orderId);

        for (const item of data) {
            await db.run(orderItemSql, [orderId, item.id, item.quantity, item.totalPrice]);
        }

        req.session.cart = [];

        res.redirect('/');
    } catch (err) {
        res.send("Error: " + err.message);
    }
});

router.get('/order', async function (req, res) {
    if (req.session.admin) {
        try {
            const db = await openDb();
            // ใช้ JOIN เพื่อดึงข้อมูล Orders พร้อม address จาก Users
            const orders = await db.all(`
                SELECT Orders.*, Users.address
                FROM Orders
                JOIN Users ON Orders.user_id = Users.user_id
            `);

            res.render('order', { allOrder: orders });
        } catch (err) {
            res.send(err.message);
        }
    } else {
        res.redirect('/');
    }
});

router.get('/deleteOrder', async (req,res) =>{
    try{
        const db = await openDb();
        const id = req.query.id;
        await db.run("DELETE FROM Order_items WHERE order_id = ?;", [id]);
        await db.run("DELETE FROM Orders WHERE order_id = ?;", [id]);
        res.redirect('/order')
    } catch(err){
        res.send(err.message)
    }
})

router.get('/changeStatus', async (req, res)=> {
    try{
        const db = await openDb();
        const id = req.query.id;
        const status = req.query.status;
        const sql = "update Orders set status = ? where order_id = ?;"
        db.run(sql, [status, id])
        res.redirect('/order')
    } catch(err){
        res.send(err.message)
    }
})

router.get('/customize', async (req, res) => {
    try {
        const db = await openDb();
        
        const layouts = await db.all('SELECT * FROM layouts');
        
        const switches = await db.all(`
            SELECT switches.*, products.name, products.img1
            FROM switches 
            JOIN products ON switches.prod_id = products.prod_id
        `);
        
        const keycaps = await db.all(`
            SELECT keycaps.*, products.name, products.img1
            FROM keycaps 
            JOIN products ON keycaps.prod_id = products.prod_id
        `);

        res.render('customize', { layouts, switches, keycaps });

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/getParts", async (req, res) => {
    const layoutId = req.query.layoutId;
    
    if (!layoutId) {
        return res.json({ cases: [], pcbs: [], plates: [] });
    }

    try {
        const db = await openDb();
        
        const cases = await db.all(`
            SELECT Cases.*, products.name, products.img1 
            FROM Cases 
            JOIN products ON Cases.prod_id = products.prod_id 
            WHERE Cases.layout_id = ?`, 
            [layoutId]
        );

        const pcbs = await db.all(`
            SELECT PCB.*, products.name, products.img1 
            FROM PCB 
            JOIN products ON PCB.prod_id = products.prod_id 
            WHERE PCB.layout_id = ?`, 
            [layoutId]
        );

        const plates = await db.all(`
            SELECT Plates.*, products.name, products.img1 
            FROM Plates 
            JOIN products ON Plates.prod_id = products.prod_id 
            WHERE Plates.layout_id = ?`, 
            [layoutId]
        );

        res.json({ cases, pcbs, plates });

    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



module.exports = router;


