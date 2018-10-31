var mongoose = require("mongoose");

var productSchema = new mongoose.Schema ({
    category   : {type: String,
                    required: [true,'category is required'],
    },
    company    : {type: String,
                    required: [true,'company is required'],
    },
    model    : {type: String,
                required: [true,'model is required']
    },
    description    : {type: String,
                  required: [true,'details is required']
    },
    name    : {type:String, 
                    index: true,
                    required : [true, 'Product Name is rquired'],
    },
    image   : { type: String,
                required: true
    },
    verified : {type: String, required: true},
    pinCode  : { type : Number, required: true},
    deliveryTime : { type: Number, required: true},
    quantity     : {
                    type: Number,
                    required: [true,'contact no. is required']
    },
    printed_price : {
                    type: Number,
                    required: [true,'Max. Retail Price is required']
    },
    discounted_price : {
                    type: Number,
    },
    sellerName : { type: String, required: true},
    date        : {type: Date, default: Date.now},
    uploadedBy:  {
                    id: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User"
                    },
                    username: String,
                    firstName: String,
                    lastName : String,
                    mobile   : Number
    }
});
module.exports = mongoose.model('Product',productSchema);