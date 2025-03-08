const path = require("path");
const express = require('express')
const router = express.Router()
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const { CLIENT_RENEG_LIMIT } = require("tls");
const { localsName } = require("ejs");

async function openDb() {
    return open({
        filename: 'keylabs.db',
        driver: sqlite3.Database
    });
}

router.get('/addToCart', function(req, res) {
    const productId = req.query.prodId; // ดึงค่าจาก URL
    const quantity = parseInt(req.query.quantity, 10);
    if (!req.session.cart) { 
        req.session.cart = [];
    }
    const existingProduct = req.session.cart.find(item => item.id === productId);
    if (existingProduct) {
        existingProduct.quantity += quantity;
    } else {
        req.session.cart.push({ id: productId, quantity: quantity });
    }
    console.log("Updated Cart:", req.session.cart);
    res.redirect(`/buy/${productId}`);
});



router.get('/cart', async function(req, res) {
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
    res.render('cart', { cart: data, totalAmount });
});

router.get('/deleteCart', async function(req, res) {
    if (req.session.userId) {
        const prodName = req.query.name;  // ดึงชื่อสินค้าที่ต้องการลบ
        const db = await openDb();
        try {
            const result = await db.get("SELECT prod_id FROM Products WHERE name = ?", [prodName]);
            const prodId = result.prod_id;

            console.log("Cart before deleting:", req.session.cart);
            req.session.cart = req.session.cart.filter(item => String(item.id) !== String(prodId));

            console.log("Cart after deleting:", req.session.cart);

            return res.redirect('/cart');
        } catch (err) {
            console.error("Database Error:", err.message);
            res.send(err.message);
        }
    } else {
        return res.redirect('/');
    }
});


module.exports = router;