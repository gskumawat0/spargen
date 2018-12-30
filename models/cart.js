const mongoose = require("mongoose");
let cartSchema = new mongoose.Schema ({
    items : [
            {   id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    unique: true},
                name: {type: String, required : true},
                price : {type : Number},
                image : {type: String},
                addedOn : {type: Date, default: Date.now},
                quantity : {type: Number,default: 0}
            }
        ],
    totalPrice: {type: Number, default: 0},
    totalQty : {type: Number, default:  0}
});
module.exports = mongoose.model('Cart', cartSchema);