let mongoose = require("mongoose");
let passportLocalMongoose = require("passport-local-mongoose");
let blogSchema = new mongoose.Schema ({
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
            }
    },
    publishedOn : {type: Date, default: Date.now},
    content : {type: String},
    tags : [
        String
        ],
    comments :  [
                  {
                     type: mongoose.Schema.Types.ObjectId,
                     ref: "Review"
                  }
               ]
});
module.exports = mongoose.model('Blog',blogSchema);    