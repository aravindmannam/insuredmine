const mongoose=require('mongoose');

const lobSchema=new mongoose.Schema({
    categoryName:{type:String}
})
const LOB=mongoose.model('LOB',lobSchema);

module.exports=LOB;