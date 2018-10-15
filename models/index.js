var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema ({
    firstName : { 
                type: String, 
                match: /[a-zA-Z]/,
                required: [true,'firstName only contains alphabets']
                },
    lastName  : { 
                type: String, 
                match: /[a-zA-Z]/,
                required: [true,'lastName only contains alphabets']
                },
    password  : { type: String
                },
    email     : { 
                type: String,
                unique: true,
                match: /[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+.[A-Za-z]/,
                required : [true, 'must to communicate to you  boss and must have @ and . ']
                },
    mobile    : {
                type : Number,
                match : /[0-9]{10}/,
                required : [true, 'mobile no. is required and must be in 10 digits']
                },
    date      : {type: Date, default: Date.now},
    newsConsent :{}

},{usePushEach: true});
userSchema.plugin(passportLocalMongoose,{ usernameField: "email", passwordField: "password" });
module.exports = mongoose.model('User',userSchema);