const mongoose = require("mongoose");

let userSchema = new mongoose.Schema ({
    user : {type: mongoose.Schema.Types.ObjectId, ref : 'User'},
    cart: {type: Object, required: true},
    address: {type: String, required: true},
    name: {type: String, required: true},
    paymentId: {type: String, required: true}
});
module.exports = mongoose.model('User',userSchema);