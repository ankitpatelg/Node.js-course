const mongoose = require('mongoose');
// const { stringify } = require('querystring');
const productSchema = new mongoose.Schema({
    name:String,
    price:String,
    category:String,
    userId:String,
    company:String
});
module.exports = mongoose.model("products",productSchema);