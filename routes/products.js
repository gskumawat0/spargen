let express         = require("express"),
    router          = express.Router({mergeParams :true}),
    mongoose        = require("mongoose"),
    bodyParser      = require("body-parser");
    
//require models
let Product = require("../models/products"),
    middleware = require("../middleware");
    
router.get('/',function(req,res){
   res.render('product/products'); 
});

router.post('/',middleware.isLoggedIn,function(req,res){
    var category = req.body.product.category;
    var company = req.body.product.company;
    var model = req.body.product.model;
    var description = req.body.product.description;
    var name = req.body.product.name;
    var quantity = req.body.product.quantity;
    var printed_price = req.body.product.printed_price;
    var discounted_price = req.body.product.discounted_price;
    var verified  = req.body.product.verified;
    var sellerName = req.body.product.sellerName;
    var pinCode    = req.body.product.pinCode;
    var deliveryTime = req.body.product.deliveryTime;
    var image     = req.body.product.image;
    var uploadedBy = {
        id: req.user._id,
        username: req.user.username,
        firstName: req.user.firstName,
        lastName : req.user.lastName,
        mobile:  req.user.mobile,
    };
    var newProduct = {category:category, sellerName:sellerName, company: company,model: model, description: description, name: name, quantity: quantity, printed_price:printed_price, discounted_price: discounted_price,   uploadedBy: uploadedBy ,pinCode : pinCode,verified: verified, deliveryTime: deliveryTime,image : image
        
    };
    Product.create(newProduct, function(err, createdProduct){
        if(err){
            console.log(err);
            req.flash('error',err.message);
            res.redirect('/products/addproduct');
        } else {
            //redirect back to campgrounds page
            console.log(createdProduct);
            req.flash('success', `thanks for adding a products. view details <a href='/products/${createdProduct._id}'>here</a>`);
            res.redirect("/products");
        }
    });
});

router.get('/addproduct',middleware.isLoggedIn,function(req,res){
   res.render('product/addProduct'); 
});
router.get("/:productId", function(req, res){
    //find the campground with provided ID
    Product.findById(req.params.productId, function(err, foundProduct){
        if(err){
            console.log(err);
            req.flash('error', err.message);
            res.redirect('/products');
        }
        else if(foundProduct === null) {
            req.flash('error', 'no product found');
            res.redirect('/products/');
        }
        else {
            //render show template with that campground
            res.render("product/testsingle", {product: foundProduct});
        }
    });
});

router.get("/:productId/edit", middleware.checkUserProduct,function(req, res){
    //find the campground with provided ID
    Product.findById(req.params.productId, function(err, foundProduct){
        if(err){
            console.log(err);
            req.flash('error', err.message);
            res.redirect(`/products/${req.params.productId}`);
        } else {
            console.log(foundProduct);
            //render show template with that campground
            res.render("product/editProduct", {product: foundProduct});
        }
    });
});
router.put('/:productId',middleware.checkUserProduct,function (req,res) {
    let productToBeUpdated = req.body.product;
    Product.findByIdAndUpdate(req.params.productId, {$set: productToBeUpdated}, function(err,updatedProduct){
        if(err){
            req.flash('error', err.message);
            res.redirect(`/products/${req.params.productId}/edit`);
        }     
        else{
            req.flash('success','successfully updated a product');
            res.redirect(`/products/${req.params.productId}`);
        }
    });
});

module.exports = router;