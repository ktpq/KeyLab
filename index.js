const express = require("express");
const app = express();
const port = 3000;

const userRouter = require('./routes/auth')
const pageRouter = require('./routes/page')


// ใช้ส่ง form ผ่าน method post
app.use(express.urlencoded({ extended: true }));

// static resources & templating engine
app.use(express.static('public'));
app.set('view engine', 'ejs');

// use Router section
app.use(userRouter)
app.use(pageRouter)

// Starting the server
app.listen(port, () => {
   console.log(`Server started at http://localhost:${port}`);
});
