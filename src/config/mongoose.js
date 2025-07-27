const mongoose = require('mongoose');


//Async function to connect to MongoDB
const mongoconnect = async(uri)=>{
    try {
        await mongoose.connect(uri);
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        throw err;
    }
};

//Exports the function
module.exports = mongoconnect;
   