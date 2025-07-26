const mongoose = require('mongoose');
const mongoconnect = async(uri)=>{
    try {
        await mongoose.connect(uri);
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        throw err;
    }
};

module.exports = mongoconnect;
   