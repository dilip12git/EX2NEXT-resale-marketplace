const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true
    },
    productId: {
        type: String,
        default: () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        unique: true
    },
    brand: { 
        type: String 
    },
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    date: { 
        type: String, 
        required: true 
    },
    price: { 
        type: String, 
        required: true 
    },
    images: { 
        type: [String], 
        required: true 
    },
    userId: {
        type: String,
        required: true
    },
    
    address: {
        type: String,  
        required: true
    },
    productStatus: {  // Boolean field indicating if the product is sold
        isSold: {
            type: Boolean,
            default: false  // Default to 'false' meaning the product is available
        }
    },
    location: {
        type: {
            type: String, 
            enum: ['Point'], 
            required: true
        },
        coordinates: {
            type: [Number], 
            required: true
        }
    }
}, { timestamps: true });

productSchema.index({ location: "2dsphere" });

const Product = mongoose.model('Product', productSchema, 'post');
module.exports = Product;
