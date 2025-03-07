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

router.get('/enterEmail', function (req, res) {
    res.render('enterEmail');
});

router.get('/enterCode', function (req, res) {
    res.render('enterCode', { email: req.session.email, password: req.session.password });
});
router.get('/buy', function (req, res) {
    res.render('buy');
});

// router.get('/products', function(req,res){
//     res.render('products')
// })

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
    const productId = req.params.id; // Get ID from URL parameter

    try {
        const db = await openDb();
        const product = await db.all("SELECT * FROM products WHERE prod_id = ?", [productId]);
        const relatedProducts = await db.all("SELECT * FROM products ORDER BY RANDOM() LIMIT 4");

        console.log("Products:", product, relatedProducts);

        res.render('buyItem', { product, relatedProducts });
    } catch (error) {
        console.error(error);
        res.status(500).send("Database Error");
    }
});

router.get('/order', function (req, res) {
    res.render('order')
})
router.get('/manuser', function (req, res) {
    res.render('manuser')
})
router.get('/payment', function (req, res) {
    res.render('payment')
})

router.get('/cart', function (req, res) {
    res.render('cart')
})

router.get('/user', function (req, res) {
    res.render('user')
})

module.exports = router