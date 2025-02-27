const path = require("path");
const express = require('express')
const router = express.Router()


router.get('/', function(req, res){
    res.render('app');
});

router.get('/sendemail', function(req, res){
    res.render('sendEmail');
});

router.get('/enterCode', function(req, res){
    res.render('enterCode');
});
router.get('/buy', function(req, res){
    res.render('buy');
});

module.exports = router