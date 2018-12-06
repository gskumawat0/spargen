let express         = require("express"),
    router          = express.Router({mergeParams :true}),
    mongoose        = require("mongoose"),
    bodyParser      = require("body-parser");
    
//require models and middleware
let Product = require("../models/products"),
    Review  = require("../models/reviews"),
    middleware = require("../middleware");

router.get("/new", middleware.isLoggedIn, function(req, res){
    // find product by id
    Product.findById(req.params.productId, function(err, foundProduct){
        if(err){
                req.flash('error', err.message);
                return res.redirect('back');

        } else {
             res.render("reviews/newReview", {product: foundProduct});
        }
    });
});

//Create Reviews
router.post("/", middleware.isLoggedIn, function(req, res){
   //lookup product using ID
   Product.findById(req.params.productId, function(err, foundProduct){
       if(err){
            req.flash('error',err.message);
            return res.redirect(`back`);
       } else {
        Review.create(req.body.review, function(err, review){
           if(err){
            req.flash('error',err.message);
            return res.redirect(`back`);    
           } else {
               //add username and id to comment
               review.createdBy = {
                   id : req.user._id,
                   user: req.user.firstName +""+ req.user.lastName,
                   username: req.user.username
               },
               //save comment
               review.save();
               foundProduct.reviews.push(review);
               foundProduct.save();
               req.flash('success', `you successfully reviewed ${foundProduct.name}`);
               res.redirect('/products/' + foundProduct._id);
           }
        });
       }
   });
});

router.get("/:reviewId/edit", middleware.isLoggedIn, middleware.checkUserReview, function(req, res){
  res.render("reviews/editReview", {product_id: req.params.productId, review: req.review});
});

router.put("/:reviewId", middleware.isAdmin, function(req, res){
   Review.findByIdAndUpdate(req.params.reviewId, req.body.review, function(err, review){
       if(err){
            req.flash('error',err.message);
            return res.redirect("back");

       } else {
           res.redirect("/products/" + req.params.productId);
       }
   }); 
});

router.delete("/:reviewId", middleware.isLoggedIn, middleware.checkUserReview, function(req, res){
  // find campground, remove comment from comments array, delete comment in db
  Product.findByIdAndUpdate(req.params.productId, {
    $pull: {
      comments: req.review.id
    }
  }, function(err) {
    if(err){ 
        req.flash('error', err.message);
        return res.redirect('back');
    } else {
        req.review.remove(function(err) {
          if(err) {
            req.flash('error', err.message);
            return res.redirect('back');
          }
          req.flash('error', 'Review deleted!');
          res.redirect("/products/" + req.params.productId);
        });
    }
  });
});


module.exports = router;