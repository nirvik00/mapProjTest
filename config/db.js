const mongoose = require('mongoose');

const connectDB = async() =>{
    const uri=process.env.MONGO_URI;
    try{
        const conn = await mongoose.connect(uri, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        });
    }catch(e){
        console.error(e);
    }
}

module.exports = connectDB;