const mongoose=require('mongoose');
const geocoder=require('../utils/geocoder');

const StoreSchema = new mongoose.Schema({
    storeId:{
        type:String,
        required: [true, 'Please add a store ID' ],
        unique: true,
        trim: true,
        maxLength: [10, 'Store ID must be less than 10 chars']
    },
    address:{
        type: String,
        require: [true, 'Please add an address']
    },
    location:{
        type:{
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
            index: '2dSphere',
        },
        formattedAddress: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// geo code location
StoreSchema.pre('save', async function(next){
    const loc = await geocoder.geocode(this.address);
    this.location = { 
        type: 'Point',
        coordinates: [
            loc[0].longitude,
            loc[0].latitude,
        ],
        formattedAddress : loc[0].formattedAddress,
    }
    this.address = undefined;
    next();
});

module.exports=mongoose.model('Store', StoreSchema);