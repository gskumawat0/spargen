var mongoose = require("mongoose");

var categorySchema = new mongoose.Schema ({
   name: String,
   image : String,
   ImageId : String
}
);    

module.exports = mongoose.model('Category', categorySchema);