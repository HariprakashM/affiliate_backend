const mongoose=require('mongoose');
const userSchema=mongoose.Schema({
    id: { type: Number },
    date_created: { type: String },
    date_created_gmt: { type: String },
    date_modified: { type: String },
    date_modified_gmt: { type: String },
    email: { type: String },
    first_name: { type: String },
    last_name: { type: String },
    role: { type: String },
    username: { type: String },
    billing: { type: Object },
    shipping: { type: Object },
    is_paying_customer: { type: Boolean},
    avatar_url: { type: String},
    meta_data: { type: Array, default: []},
    _links: {type:Object }
    
    
},{timestamps:true});

const userModel=mongoose.model('users', userSchema);
module.exports=userModel;