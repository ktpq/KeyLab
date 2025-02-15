const express = require("express");
const path = require("path");
const port = 3000;

const app = express();


// static resourse & templating engine
app.use(express.static('public'));
app.set('view engine', 'ejs');


// routing path
app.get('/', function(req, res){
    res.render('app')
})

app.get('/login', function(req, res){
    res.render('login')
})

// Starting the server
app.listen(port, () => {
   console.log("Server started.");
 });