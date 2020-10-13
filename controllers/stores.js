const Store= require('../models/Store');


// @desc Get all stores
// @route GET /api/v1/stores
// @access Public

exports.getStores = async(req, res, next) => {
    try{
        let stores= await Store.find({});
        return res.status(200).json({
            success: true,
            count: stores.length,
            data: stores
        });
    }catch(e){
        return res.status(500).json({msg: 'error in GET server'})
    }   
}

// @desc Create a store
// @route POST /api/v1/stores
// @access Public
exports.addStore = async(req, res, next) => {
    try{
        console.log(req.body);
        const store= await Store.create(req.body);
        return res.status(200).json({
            success: true,
            data: store
        });
    }catch(e){
        console.error(e);
        return res.status(500).json({msg: 'error in POST server'});
    }
}
