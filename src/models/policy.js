const mongoose=require('mongoose');

const policySchema=new mongoose.Schema({
    policyNumber:{type:String},
    startDate:{type:Date},
    endDate:{type:Date},
    policyCategoryId:{ type: mongoose.Schema.Types.ObjectId, ref: 'LOB' },
    companyId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Carrier'},
    userId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User'},
})

const Policy=mongoose.model('Policy',policySchema);
module.exports=Policy;