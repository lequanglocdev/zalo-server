require("dotenv").config();
const express = require("express");
const dbConnect = require('./config/dbConnect')
const initRoutes = require('./routes')
const cookieParrser = require('cookie-parser')

const app = express();
app.use(cookieParrser())
const port = process.env.PORT || 8888;

// đọc hiểu data mà client gửi lên
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

dbConnect()
initRoutes(app)


app.use('/',(req,res) =>{res.send("Server success")})
app.listen(port, () => {
  console.log( 'Server running on the port:',+port)
});
