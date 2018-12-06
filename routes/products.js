let express         = require("express"),
    router          = express.Router({mergeParams :true}),
    mongoose        = require("mongoose"),
    bodyParser      = require("body-parser"),
    cloudinary      = require('cloudinary'),
    multer          = require('multer');
    
//require models and middleware
let Product = require("../models/products"),
    Review  = require("../models/reviews"),
    middleware = require("../middleware");
  
let storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() +"_"+ file.originalname);
  },
});
let imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

let upload = multer({ storage: storage, fileFilter: imageFilter});

cloudinary.config({ 
  cloud_name: 'gskumawat', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});
    
router.get("/", function(req, res){
    var perPage = 8;
    var pageQuery = parseInt(req.query.page, 10);
    var pageNumber = pageQuery ? pageQuery : 1;
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Product.find({name: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allProducts) {
            if(err){
                req.flash("error",err.message);
                return res.redirect('back');
            }
            Product.count({name: regex}).exec(function (err, count) {
                if (err) {
                    req.flash('error',err.message);
                    return res.redirect("back");
                } else {
                    if(allProducts.length < 1) {
                        noMatch = "No products match with your search, please try another combinations.";
                    }
                    res.render("product/products", {
                        products: allProducts,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        noMatch: noMatch,
                        search: req.query.search
                    });
                }
            });
        });
    } else {
        // get all campgrounds from DB
        Product.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allProducts) {
            if(err){
                req.flash('error',err.message);
                return res.redirect('back');
            }
            Product.count().exec(function (err, count) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("product/products", {
                        products: allProducts,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        noMatch: noMatch,
                        search: false
                    });
                }
            });
        });
    }
});

router.post('/',middleware.isLoggedIn, upload.single('product[image]'), function(req,res){
    if(req.file){
    cloudinary.uploader.upload(req.file.path, function(result) {
    let newProduct = {
        category     : req.body.product.category,
        sellerName   : req.body.product.sellerName, 
        company      : req.body.product.company,
        model        : req.body.product.model,
        description  : req.body.product.description, 
        name         : req.body.product.name, 
        quantity     : req.body.product.quantity, 
        printed_price: req.body.product.printed_price, 
        discounted_price: req.body.product.discounted_price,
        uploadedBy   : {
                id      : req.user._id,
                username: req.user.username,
                user    : req.user.firstName+" "+ req.user.lastName,
                mobile  : req.user.mobile,
            },
        pinCode      : req.body.product.pinCode,
        verified     : req.body.product.verified, 
        deliveryTime : req.body.product.deliveryTime,
        image        : result.secure_url,
        imageId      : result.public_id
    };
    
    Product.create(newProduct, function(err, createdProduct){
        if(err){
            req.flash('error',err.message);
            return res.redirect('back');
        } else {
            req.flash('success', `thanks for adding a products. view details <a href='/products/${createdProduct._id}'>here</a>`);
            res.redirect(`/products/${createdProduct._id}`);
        }
    });
     },{
         folder: 'product_images',
         use_filename: true
        });       
    }
    else{
        req.flash('error',`image can't uploaded`);
        return res.redirect('back');
    }
});

router.get('/addproduct',middleware.isLoggedIn,function(req,res){
   res.render('product/addProduct'); 
});

router.get("/:productId", function(req, res){
    //find the campground with provided ID
    Product.findById(req.params.productId).populate("reviews").exec( function(err, foundProduct){
        if(err){
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
            req.flash('error', err.message);
             return res.redirect(`back`);
        } else {
            //render show template with that campground
            res.render("product/editProduct", {product: foundProduct});
        }
    });
});
router.put('/:productId',middleware.checkUserProduct,upload.single('product[image]'), function(req,res) {
    
            Product.findById(req.params.productId, async function(err,foundProduct){
                if(err){
                    req.flash('error', err.message);
                    return res.redirect(`back`);
                }     
                else{
                    if(req.file){
                        try {
                            await cloudinary.uploader.destroy(foundProduct.imageId); 
                            let result = await cloudinary.uploader.upload(req.file.path);
                            req.body.product.imageId = result.public_id;
                            req.body.product.image   = result.secure_url;
                            req.body.product.updatedOn = foundProduct.updatedOn + " , " + Date(Date.now).toString();
                        }
                        catch(err){
                            req.flash('error',err.message);
                            return res.redirect('back');
                        }
                        }
                Product.findOneAndUpdate(foundProduct._id, { $set: req.body.product}, function(err, updatedProduct){
                   if(err){
                        req.flash("error", err.message);
                        return res.redirect('back');
                   }
                   else{
                        req.flash('success','successfully updated a product');
                        res.redirect(`/products/${updatedProduct._id}`);                       
                   }
                });
        }
    });
});

router.delete('/:productId', middleware.checkUserProduct, function(req,res){
    Product.findById(req.params.productId, async function(err,productToDelete){
        try{
            await cloudinary.uploader.destroy(productToDelete.imageId);
            Product.findByIdAndDelete(productToDelete._id,function(err){
                if(err){
                    req.flash('error',err.message);
                    return res.redirect('back');
                }
            });
        }
        catch(err){
            req.flash("error", err.message);
            return res.redirect('back'); 
        }
    });
    req.flash('success', `product deleted successfully. add new product <a href='/products/addproducts'>here</a>`);
    res.redirect('/products');
});

//regex validate
function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
module.exports = router;