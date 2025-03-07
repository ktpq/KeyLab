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

// router.get('/', function(req, res){
//     res.render('app');
// });

router.get('/', async (req, res) => {
    try {
        const db = await openDb();
        const products = await db.all("SELECT * FROM products ORDER BY RANDOM() LIMIT 4"); // Fetch all products

        // Shuffle the array using Fisher-Yates algorithm
        for (let i = products.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [products[i], products[j]] = [products[j], products[i]];
        }

        res.render('app', { products }); // Send shuffled products to frontend
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

router.get('/buy', function(req, res){
    res.render('buy');
});

// router.get('/products', function(req,res){
//     res.render('products')
// })

router.get('/products', async (req, res) => {
    try {
        const db = await openDb();
        const keycaps = await db.all("SELECT * FROM products WHERE category = 'keycap'");
        const switches = await db.all("SELECT * FROM products WHERE category = 'switch'");
        const cases = await db.all("SELECT * FROM products WHERE category = 'case'");
        const pcb = await db.all("SELECT * FROM products WHERE category = 'pcb'");
        const plates = await db.all("SELECT * FROM products WHERE category = 'Plates'");

        console.log("Keycaps:", keycaps);
        console.log("Switches:", switches);
        console.log("Cases:", cases);
        console.log("PCB:", pcb);
        console.log("Plates:", plates);

        res.render('products', { keycaps, switches, cases, pcb, plates });
    } catch (error) {
        console.error(error);
        res.status(500).send("Database Error");
    }
});

router.get('/pbproducts', async (req, res) => {
    try {
        const db = await openDb();
        const pre_built = await db.all("SELECT * FROM products WHERE category = 'pre-built'");

        console.log("pre-built:", pre_built);

        res.render('pbproducts', { pre_built });
    } catch (error) {
        console.error(error);
        res.status(500).send("Database Error");
    }
});

router.get('/kitsproduct', async (req, res) => {
    try {
        const db = await openDb();
        const keyboard_kits = await db.all("SELECT * FROM products WHERE category = 'kit'");

        console.log("kit:", keyboard_kits);

        res.render('kitsproduct', { keyboard_kits });
    } catch (error) {
        console.error(error);
        res.status(500).send("Database Error");
    }
});

router.get('/buy/:id', async (req, res) => {
    const productId = req.params.id; // Get ID from URL parameter

    try {
        const db = await openDb();
        const product = await db.all("SELECT * FROM products WHERE prod_id = ?", [productId]);
        const relatedProducts = await db.all("SELECT * FROM products WHERE prod_id != ? LIMIT 4", [productId]);

        console.log("Products:", product, relatedProducts);

        res.render('buyItem', { product, relatedProducts });
    } catch (error) {
        console.error(error);
        res.status(500).send("Database Error");
    }
});

router.get('/order', function(req,res){
    res.render('order')
})
router.get('/manuser', function(req,res){
    res.render('manuser')
})
router.get('/payment', function(req,res){
    res.render('payment')
})

router.get('/cart', function(req,res){
    res.render('cart')
})

router.get('/enterEmail', async function(req, res){
    const db = await openDb();
    const userId = req.session.user_id;
    const email = await db.get("SELECT email FROM Users WHERE user_id = ?", [userId]);
    const address = await db.get("SELECT address FROM Users WHERE user_id = ?", [userId]);
    console.log(userId);
    if (userId == null) {
        res.render('enterEmail');
    } else {
        // Redirect to /user/:id path
        res.redirect('user', {userId, email, address});
    }
});

router.get('/user', async function (req, res) {
    const userId = req.session.userId
    console.log(userId)
    // ตรวจสอบว่า id ต้องไม่ว่างเปล่าและต้องเป็นตัวเลข
    if (!userId || isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }

    try {
        const db = await openDb();
        const email = await db.get("SELECT email FROM Users WHERE user_id = ?", [userId]);
        const address = await db.get("SELECT address FROM Users WHERE user_id = ?", [userId]);

        const sql = "SELECT * FROM Users WHERE user_id = ?";
        const row = await db.get(sql, [userId]);

        if (!row) {
            return res.status(404).json({ error: "User not found" });
        }

        // ส่งข้อมูลไปยังเทมเพลต user
        res.render('user', { userId, email , address});
    } catch (err) {
        console.error("Database error:", err.message);
        res.status(500).json({ error: "Database error" });
    }
});

module.exports = router;


