const mongoose=require('mongoose');

const agentSchema=new mongoose.Schema({
    agentName:{type:String}
},{timestamps:true})
const Agent=mongoose.model('Agent',agentSchema);

module.exports=Agent;