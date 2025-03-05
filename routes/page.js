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

router.get('/', function(req, res){
    res.render('app');
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

// router.get('/products', async (req, res) => {
//     try {
//         const db = await openDb();
//         const keycaps = await db.all("SELECT * FROM products WHERE type = 'Keycaps'");
//         const switches = await db.all("SELECT * FROM products WHERE type = 'Switches'");
//         const cases = await db.all("SELECT * FROM products WHERE type = 'Cases'");

//         res.render('products', { keycaps, switches, cases });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Database Error");
//     }
// });

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