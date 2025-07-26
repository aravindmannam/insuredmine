const mongoose=require('mongoose');

const lobSchema=new mongoose.Schema({
    categoryName:{type:String}
},{timestamps:true})
const LOB=mongoose.model('LOB',lobSchema);

module.exports=LOB;