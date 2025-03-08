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

        console.log("Products:", product, relatedProducts);

        res.render('buyItem', { product, relatedProducts });
    } catch (error) {
        console.error(error);
        res.status(500).send("Database Error");
    }
});

router.get('/order', function (req, res) {
    res.render('order')
});
router.get('/manuser', function (req, res) {
    res.render('manuser')
});
router.get('/payment', function (req, res) {
    res.render('payment')
});

router.get('/cart', function (req, res) {
    res.render('cart')
});

// router.get('/customize', async (req, res) => {
//     try {
//         const db = await openDb();
        
//         const layouts = await db.all('SELECT * FROM layouts');
        
//         const switches = await db.all(`
//             SELECT switches.*, products.name 
//             FROM switches 
//             JOIN products ON switches.prod_id = products.prod_id
//         `);
        
//         const keycaps = await db.all(`
//             SELECT keycaps.*, products.name 
//             FROM keycaps 
//             JOIN products ON keycaps.prod_id = products.prod_id
//         `);

//         res.render('customize', { layouts, switches, keycaps });

//     } catch (err) {
//         console.error("Database Error:", err);
//         res.status(500).send("Internal Server Error");
//     }
// });


// router.get("/getParts", async (req, res) => {
//     const layoutId = req.query.layoutId;
    
//     if (!layoutId) {
//         return res.json({ cases: [], pcbs: [], plates: [] });
//     }

//     try {
//         const db = await openDb();
        
//         const cases = await db.all(`
//             SELECT Cases.*, products.name 
//             FROM Cases 
//             JOIN products ON Cases.prod_id = products.prod_id 
//             WHERE Cases.layout_id = ?`, 
//             [layoutId]
//         );

//         const pcbs = await db.all(`
//             SELECT PCB.*, products.name 
//             FROM PCB 
//             JOIN products ON PCB.prod_id = products.prod_id 
//             WHERE PCB.layout_id = ?`, 
//             [layoutId]
//         );

//         const plates = await db.all(`
//             SELECT Plates.*, products.name 
//             FROM Plates 
//             JOIN products ON Plates.prod_id = products.prod_id 
//             WHERE Plates.layout_id = ?`, 
//             [layoutId]
//         );

//         console.log(`Layout ID: ${layoutId}`);
//         console.log("Cases:", cases);
//         console.log("PCBs:", pcbs);
//         console.log("Plates:", plates);

//         res.json({ cases, pcbs, plates });

//     } catch (error) {
//         console.error("Database error:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });

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


