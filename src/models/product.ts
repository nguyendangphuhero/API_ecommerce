import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, 'A name is required']
    },
    price:{
        type:Number,
        required:[true, 'A price is required']
    },
    imageUrl:{
        type:String,
        required:[true, 'An image url is required']
    },
    category:{
        type:String,
        required:[true, 'A category id is required']
    },
    details:{
        type:String,
        required:[true, 'Product details are required']
    }
});


const Product = mongoose.model('Product',productSchema);

export default Product;