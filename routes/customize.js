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

router.get('/cartCustom', async (req, res) =>{
    if (req.session.userId) {
        const dataString = req.query.data;
        const data = JSON.parse(decodeURIComponent(dataString)); // แปลงข้อมูลจาก JSON string กลับเป็น array
        if (!req.session.cart) {
            req.session.cart = []
        }
        data.forEach((prod) => {
            const existingProduct = req.session.cart.find(item => item.id === prod);
            if (existingProduct) {
                existingProduct.quantity += quantity;
            } else {
                req.session.cart.push({ id: prod, quantity: 1 });
            }
            console.log("Updated Cart:", req.session.cart);
        })
        res.redirect('/customize')
    }
})


router.get('/wishlist', async (req,res) =>{
    if (req.session.userId){
        res.render('wishlist')
    }
})
module.exports = router;