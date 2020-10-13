const express= require('express');
const path= require('path')
const dotenv = require('dotenv');
const cors=require('cors');

const connectDB=require('./config/db');

//load env vars
dotenv.config({path: './config/config.env'});

// connect db
connectDB();

const app=express();

app.use(express.json());
app.use(cors());


/// set static folder
app.use(express.static(path.join(__dirname, 'public')));


//routes
app.use('/api/v1/stores', require('./routes/stores'));
app.use('/api/v1/stores', require('./routes/stores'));

const port=process.env.PORT || 5500;
app.listen(port, ()=>{
    console.log(`server started on port ${port}`);
});