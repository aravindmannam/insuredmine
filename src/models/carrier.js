const mongoose=require('mongoose');

const carrierSchema=new mongoose.Schema({
    companyName:{type:String}
},{timestamps:true})
const Carrier=mongoose.model('Carrier',carrierSchema);

module.exports=Carrier;