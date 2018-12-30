let express         = require("express"),
    router          = express.Router({mergeParams :true}),
    mongoose        = require("mongoose"),
    cloudinary      = require('cloudinary'),
    multer          = require('multer'),
    bodyParser      = require("body-parser");
    
//require models and middleware
let Product = require("../models/products");
let Category = require("../models/category");
let middleware = require("../middleware/index");

  
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




router.get("/", middleware.isAdmin, function(req, res){
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
                    res.render("admin/admin-product", {
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
                    res.render("admin/admin-product", {
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

// save category to db
router.post('/category', middleware.isAdmin, upload.single('category[image]'), async  function(req,res, next){
    try {
        let result = await cloudinary.v2.uploader.upload(req.file.path,{  // upload image to cloudinary
         folder: 'category_images',
         use_filename: true
        }); 
         let newCategory = {   //create new category name
                name : req.body.category.name.toLowerCase(),
                image : result.secure_url,
                imageId : result.public_id
            };
            let ctg = await Category.findOne( {name : req.body.category.name.toLowerCase()}); // find if category name already exits
            if(ctg === null){
                let addedCtg = await Category.create(newCategory);
                // console.log(addedCtg);
                req.flash('success',`a new category ${addedCtg.name} added`);
            }
            else {
                req.flash('error', 'category already exits');
            }
            res.redirect('back');
            }
    catch(err){
        req.flash('error', err.message, err.name);
        // console.log(err);
        res.redirect('back');
    }
});




//regex validate
function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;