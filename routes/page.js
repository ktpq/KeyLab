const path = require("path");
const express = require('express')
const router = express.Router()


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

router.get('/products', function(req,res){
    res.render('products')
})
router.get('/order', function(req,res){
    res.render('order')
})
router.get('/manuser', function(req,res){
    res.render('manuser')
})
router.get('/payment', function(req,res){
    res.render('payment')
})

module.exports = router