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
    res.render('enterEmail');
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
        const pcb = await db.all("SELECT * FROM products WHERE category = 'PCB'");
        const plates = await db.all("SELECT * FROM products WHERE category = 'Plate'");

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

router.get('/user', function(req,res){
    res.render('user')
})

module.exports = router