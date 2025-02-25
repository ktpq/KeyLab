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
    res.render('enterCode');
});

module.exports = router