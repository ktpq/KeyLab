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

router.get('/addToCart', function(req, res){
    const productId = req.query.prodId; // ดึงค่าจาก URL
    const quantity = req.query.quantity;
    if (localStorage.getItem("cart") !== null){
        
    } else {
        localStorage.setItem("cart", [])
        const store = localStorage.getItem("cart");
    }
    console.log("id: "+ productId)
    console.log("quatity: "+ quantity)
    res.redirect(`/buy/${productId}`)
})

module.exports = router;