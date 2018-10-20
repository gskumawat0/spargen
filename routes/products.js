var express         = require("express"),
    router          = express.Router({mergeParams :true}),
    mongoose        = require("mongoose"),
    bodyParser      = require("body-parser");
    
router.get('/',function(req,res){
   res.render('product/products'); 
});

router.get('/addproduct',function(req,res){
   res.render('product/addProduct'); 
});

module.exports = router;