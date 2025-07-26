const mongoose=require('mongoose');

const userAccountSchema=new mongoose.Schema({
    userId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    accountName:{type:String}
})


const UserAccount=mongoose.model('UserAccount',userAccountSchema);

module.exports=UserAccount;