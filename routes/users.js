const express       = require("express"),
    router          = express.Router({mergeParams :true}),
    mongoose        = require("mongoose"),
    bodyParser      = require("body-parser");

router.get('/', function(req,res){
   res.send('a user will be displayed here and your user id is : ' + req.params.userId ); 
});



module.exports = router;