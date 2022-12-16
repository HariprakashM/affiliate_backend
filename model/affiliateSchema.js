const mongoose=require('mongoose');
const affiliateSchema=mongoose.Schema({
    affiliate_id:{type:String,required:true},
    affiliate_name:{type:String,required:true},
    affiliate_url:{type:String,required:true},
    first_name: { type: String,required:true },
    last_name: { type: String ,required:true},
    full_name: { type: String ,required:true},
    rate: { type: String ,default:"5%" },
    payout_method: { type: String ,default:"Payout" },
    paid_earnings:{type:Number,default:0},
    unpaid_earnings:{type:Number,default:0},
    paid_referals:{type:Number,default:0},
    unpaid_referals:{type:Number,default:0},
    refered_by:{type:String,default:null},
    wallet:{type:Number,default:0},
    
},{timestamps:true});

const affiliateModel=mongoose.model('affiliates', affiliateSchema);
module.exports=affiliateModel;
