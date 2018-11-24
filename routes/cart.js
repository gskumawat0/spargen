const express       = require("express"),
    router          = express.Router({mergeParams :true}),
    mongoose        = require("mongoose"),
    bodyParser      = require("body-parser");
    
const Product       = require("../models/products"),
      Cart          = require("../models/cart");
const middleware    = require("../middleware/index");

router.get('/', function(req, res, next) {
   if (!req.session.cart) {
       return res.render('cart/cart', {products: null});
   } 
    var cart = new Cart(req.session.cart);
    res.render('cart/cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
});

router.get('/checkout', middleware.isLoggedIn, function(req, res, next) {
    if (!req.session.cart) {
        req.flash('error','no product in cart. please add some products first');
        return res.redirect('/products');
    }
    let cart = new Cart(req.session.cart);
    req.flash('error','error happened in payment process');
    res.render('cart/checkout', {total: cart.totalPrice});
});
    
router.get('/:productId', function(req, res) {
    let cart = new Cart(req.session.cart ? req.session.cart : {});
    
    Product.findById(req.params.productId,function(err,foundProduct){
        if(err){
            req.flash('error', err.message);
            return res.redirect('back');
        }
        else if(foundProduct === null){
            req.flash('error', 'No product found');
            return res.redirect('back');
        }
        else{
            cart.add(foundProduct, foundProduct.id);
            req.session.cart = cart;
            req.flash('success',`product added to cart. see <a href='/cart/'>here</a>`);
            res.redirect(`/products/${foundProduct.id}`);
        }
    });
});
router.get('/reduce/:productId', function(req, res, next) {
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    cart.reduceByOne(req.params.productId);
    req.session.cart = cart;
    res.redirect('/cart');
});

router.get('/remove/:productId', function(req, res, next) {
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.removeItem(req.params.productId);
    req.session.cart = cart;
    res.redirect('/cart');
});


router.get('/checkout',function(req, res) {
    res.render('cart/checkout');
});
    
    
module.exports = router;