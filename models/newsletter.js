let mongoose = require("mongoose");
let newsletterSchema = new mongoose.Schema ({
    email : { type : String, required : true},
    date : {type: Date, default: Date.now()}
});
module.exports = mongoose.model('NewsLetter',newsletterSchema);    