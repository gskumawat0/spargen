var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema ({
    firstName   : {type: String,
                    match: /[A-Za-z- ]{1,}/,
                    required: [true,'firstName is required'],
    },
    lastName    : {type: String,
                    match: /[A-Za-z- ]{1,}/,
                    required: [true,'lastName is required'],
    },
    password    : {type: String
    },
    username    : {type:String, 
                    unique: true, 
                    index: true,
                    match: /^[A-Za-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/,
                    required : [true, 'username is rquired'],
    },
    mobile      : {
                    type: Number,
                    required: [true,'contact no. is required']
    },
    date        : {type: Date, default: Date.now},
    resetPasswordToken : String,
    resetPasswordExpires : Date,
    newsConsent :{}

});
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User',userSchema);