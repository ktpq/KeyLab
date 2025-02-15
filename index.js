const express = require("express");
const path = require("path");
const port = 3000;


// Creating the Express server
const app = express();

// static resourse & templating engine
app.use(express.static('public'));
// Set EJS as templating engine
app.set('view engine', 'ejs');


// routing path
app.get('/', function(req, res){
    res.render('index')
})

// Starting the server
app.listen(port, () => {
   console.log("Server started.");
 });