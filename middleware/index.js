var Product = require("../models/products");


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
};