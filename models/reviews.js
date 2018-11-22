const mongoose = require("mongoose");

var reviewSchema = mongoose.Schema({
    text: String,
    createdAt: { type: Date, default: Date.now },
    createdBy:  {  
                id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                },
                username: String,
                user: String,
                mobile   : Number
            }
});

module.exports = mongoose.model("Review", reviewSchema);