const mongoose=require('mongoose');
const referralSchema=mongoose.Schema({
    referral_id:{type:Number,required:true,default:0},
    amount:{type:Number,required:true},
    affiliate_name:{type:String,required:true},
    reference: { type: String,required:true },
    description: { type: String ,required:true},
    type: { type: String ,default:"Sale"},
    date: { type: String ,required:true },
    payout_method: { type: String },
    status: { type: String ,default:"on-hold"}
    
    
},{timestamps:true});

const referralModel=mongoose.model('referrals', referralSchema);
module.exports=referralModel;
