var Product = require("../models/products"),
    Review  = require("../models/reviews");


module.exports = {
    isLoggedIn: function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash("error", "You must be signed in to do that!");
        res.redirect("/login");
    },
    checkUserProduct: function(req, res, next){
        if(req.isAuthenticated()){
            Product.findById(req.params.productId, function(err, product){
                if(err){
                    req.flash('error',err.message);
                    res.redirect('/login');
                }
               if(product.uploadedBy.id.equals(req.user._id)|| req.user.isAdmin){
                   next();
               } else {
                   req.flash("error", "You don't have permission to do that!");
                   res.redirect("/products/" + req.params.productId);
               }
            });
        } else {
            req.flash("error", "You need to be signed in to do that!");
            res.redirect("/login");
        }
    },
      checkUserReview: function(req, res, next){
        Review.findById(req.params.reviewId, function(err, foundReview){
           if(err || !foundReview){
               req.flash('error', 'Sorry, that comment does not exist!');
               return res.redirect('back');
           } else if(foundReview.createdBy.id.equals(req.user._id) || req.user.isAdmin){
                req.review = foundReview;
                next();
           } else {
               req.flash('error', 'You don\'t have permission to do that!');
               res.redirect('/campgrounds/' + req.params.id);
           }
        });
      },
      isAdmin: function(req, res, next) {
        if(req.user.isAdmin) {
          next();
        } else {
          req.flash('error', 'This site is now read only. thanks to spam and trolls.');
          res.redirect('back');
        }
      }
};