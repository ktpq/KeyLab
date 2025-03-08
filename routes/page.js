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

router.get('/', async (req, res) => {
    try {
        const db = await openDb();
        const products = await db.all("SELECT * FROM products ORDER BY RANDOM() LIMIT 4");

        for (let i = products.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [products[i], products[j]] = [products[j], products[i]];
        }

        res.render('app', { products });
    } catch (error) {
        console.error(error);
        res.status(500).send("Database Error");
    }
});


router.get('/enterEmail', function(req, res){
    const userId = req.session.userId;
    console.log(userId)
    if (userId) {
        res.redirect('/user');
    } else {
        // ใช้ไฟล์เทมเพลตที่มีอยู่และส่ง userId เป็นตัวแปรไปยังเทมเพลต
        res.render('enterEmail');
    }
});



router.get('/enterCode', function(req, res){
    res.render('enterCode', { email: req.session.email, password: req.session.password });
});


router.get('/buy', function (req, res) {
    res.render('buy');
});

router.get('/products', async (req, res) => {
    try {
        const db = await openDb();
        let sortBy = req.query.sort || '';

        const sortOptions = {
            lowtohigh: "ORDER BY price ASC",
            hightolow: "ORDER BY price DESC",
            atoz: "ORDER BY name COLLATE NOCASE ASC",
            ztoa: "ORDER BY name COLLATE NOCASE DESC",
            oldtonew: "ORDER BY prod_id ASC",
            newtoold: "ORDER BY prod_id DESC"
        };

        let orderClause = sortOptions[sortBy] || "";

        const keycaps = await db.all(`SELECT * FROM products WHERE category = 'keycap' ${orderClause}`);
        const switches = await db.all(`SELECT * FROM products WHERE category = 'switch' ${orderClause}`);
        const cases = await db.all(`SELECT * FROM products WHERE category = 'case' ${orderClause}`);
        const pcb = await db.all(`SELECT * FROM products WHERE category = 'pcb' ${orderClause}`);
        const plates = await db.all(`SELECT * FROM products WHERE category = 'Plates' ${orderClause}`);

        res.render('products', { keycaps, switches, cases, pcb, plates, sortBy });
    } catch (error) {
        console.error(error);
        res.status(500).send("Database Error");
    }
});

router.get('/pbproduct', async (req, res) => {
    try {
        const db = await openDb();
        let sortBy = req.query.sort || '';

        const sortOptions = {
            lowtohigh: "ORDER BY price ASC",
            hightolow: "ORDER BY price DESC",
            atoz: "ORDER BY name COLLATE NOCASE ASC",
            ztoa: "ORDER BY name COLLATE NOCASE DESC",
            oldtonew: "ORDER BY prod_id ASC",
            newtoold: "ORDER BY prod_id DESC"
        };

        let orderClause = sortOptions[sortBy] || "";

        const pre_built = await db.all(`SELECT * FROM products WHERE category = 'pre-built' ${orderClause}`);

        res.render('pbproducts', { pre_built, sortBy });
    } catch (error) {
        console.error(error);
        res.status(500).send("Database Error");
    }

});

router.get('/kitsproduct', async (req, res) => {
    try {
        const db = await openDb();
        let sortBy = req.query.sort || '';

        const sortOptions = {
            lowtohigh: "ORDER BY price ASC",
            hightolow: "ORDER BY price DESC",
            atoz: "ORDER BY name COLLATE NOCASE ASC",
            ztoa: "ORDER BY name COLLATE NOCASE DESC",
            oldtonew: "ORDER BY prod_id ASC",
            newtoold: "ORDER BY prod_id DESC"
        };

        let orderClause = sortOptions[sortBy] || "";

        const keyboard_kits = await db.all(`SELECT * FROM products WHERE category = 'kit' ${orderClause}`);

        res.render('kitsproduct', { keyboard_kits , sortBy });
    } catch (error) {
        console.error(error);
        res.status(500).send("Database Error");
    }
});

router.get('/buy/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const db = await openDb();
        const product = await db.all("SELECT * FROM products WHERE prod_id = ?", [productId]);
        const relatedProducts = await db.all("SELECT * FROM products ORDER BY RANDOM() LIMIT 4");

        // console.log("Products:", product, relatedProducts);

        res.render('buyItem', { product, relatedProducts });
    } catch (error) {
        console.error(error);
        res.status(500).send("Database Error");
    }
});



router.get('/payment', async function (req, res) {
    if (!req.session.userId) {
        return res.redirect('/');
    }

    const cart = req.session.cart || [];
    const db = await openDb();
    const data = [];

    await Promise.all(cart.map(async (item) => {
        const id = item.id;
        const quantity = item.quantity;

        try {
            const product = await db.get("SELECT img1, name, price FROM Products WHERE prod_id = ?", [id]);

            if (product) {
                data.push({
                    id: id,
                    img: product.img1 || "", 
                    name: product.name || "", 
                    price: product.price || 0, 
                    quantity: quantity, 
                    totalPrice: quantity * (product.price || 0) 
                });
            }
        } catch (err) {
            console.error("Database Error:", err.message);
        }
    }));
    const totalAmount = data.reduce((sum, item) => sum + item.totalPrice, 0);
    res.render('payment', { data: data, totalAmount });
})



router.get('/user', async (req, res) => {
    const userId = req.session.userId
    // console.log(userId)
    // ตรวจสอบว่า id ต้องไม่ว่างเปล่าและต้องเป็นตัวเลข
    if (!userId || isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }

    try {
        const db = await openDb();
        const email = await db.get("SELECT email FROM Users WHERE user_id = ?", [userId]);
        const address = await db.get("SELECT address FROM Users WHERE user_id = ?", [userId]);
        const orders = await db.all("select * from Orders where user_id = ?", [Number(userId)]);
        console.log("order" + JSON.stringify(orders))
        const sql = "SELECT * FROM Users WHERE user_id = ?";
        const row = await db.get(sql, [userId]);

        if (!row) {
            return res.status(404).json({ error: "User not found" });
        }

        // ส่งข้อมูลไปยังเทมเพลต user
        res.render('user', { userId, email , address, orders});
    } catch (err) {
        console.error("Database error:", err.message);
        res.status(500).json({ error: "Database error" });
    }
});

router.get('/orderItems', async(req, res)=>{
    if (req.session.userId){
            try{
                const orderId = req.query.orderId;
                console.log(Number(orderId))
                console.log(req.session.userId)
                const db = await openDb();
                const sql = `SELECT Order_items.price, 
                                Order_items.quantity, 
                                Orders.status, 
                                Order_items.prod_id, 
                                Products.img1,
                                Products.name
                            FROM Order_items
                            INNER JOIN Orders ON Orders.order_id = Order_items.order_id
                            INNER JOIN Products ON Order_items.prod_id = Products.prod_id
                            WHERE Orders.user_id = ? AND Order_items.order_id = ?;`
                const data = await db.all(sql, [req.session.userId, orderId]);
                console.log(JSON.stringify(data))
                res.render('orderItems', {items:data})
            } catch(err){
                res.send(err.message)
            }
    } else {
        res.redirect('/')
    }
})

module.exports = router;


