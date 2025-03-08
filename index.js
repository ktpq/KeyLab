const express = require("express");
const app = express();
const port = 3000;

const session = require('express-session')

const userRouter = require('./routes/auth')
const pageRouter = require('./routes/page')
const cartRouter = require('./routes/cart')
const orderRouter = require('./routes/order')
const adminRouter = require('./routes/admin')
const customizeRouter = require('./routes/customize')

// ใช้ส่ง form ผ่าน method post
app.use(express.urlencoded({ extended: true }));

// static resources & templating engine
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(session({secret:"mysession", resave:false,saveUninitialized:false}))

// use Router section
app.use(userRouter)
app.use(pageRouter)
app.use(cartRouter)
app.use(orderRouter)
app.use(adminRouter)
app.use(customizeRouter)

// Starting the server
app.listen(port, () => {
   console.log(`Server started at http://localhost:${port}`);
});
