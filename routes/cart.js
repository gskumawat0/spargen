const express       = require("express"),
    router          = express.Router({mergeParams :true}),
    mongoose        = require("mongoose"),
    bodyParser      = require("body-parser");
    
const Product       = require("../models/products"),
      Cart          = require("../models/cart");
const middleware    = require("../middleware/index");

router.get('/',middleware.isLoggedIn, async function(req, res, next) {
    try{
        let cartItems = await Cart.findById(req.user.cart.id);
                                    // select('items.id').exec();
        // console.log(cartItems);
        if(cartItems === null || cartItems.items.length === 0){
            req.flash('error', 'No items in cart. Please add some items in cart first');
            return res.redirect('/products');
        }
        return res.render('cart/cart',{cart : cartItems});
    }
    catch(err){
        req.flash('error', err.message);
        return res.redirect('back');
    }
});

router.post('/:productId',middleware.isLoggedIn, async function(req, res, next) {
    try{
        // console.log("i'm here");
        let user = req.user;
        let cart = await Cart.findById(user.cart.id);
        let product = await Product.findById(req.params.productId);
        // console.log(product);
        let price = parseInt(product.discounted_price || product.printed_price,10);
        let qty = parseInt(req.body.product.quantity,10);
        let newItem = {
                        id : product._id,
                        quantity : qty, 
                        name : product.name,
                        price : price,
                        image : product.image, 
                    };
        if(product === null){
            req.flash('error', 'No product found. Please choose a existing product');
            res.redirect('back');
        }
        // console.log('now cart is ', cart);
        if(cart === null){
            let newCartItem = {
                items : [newItem],
                totalQty : qty,
                totalPrice: qty * price
            };
            
            let createdCart = await Cart.create(newCartItem);
            // console.log('im here', newCartItem);
            user.cart.id = createdCart._id;
            user.save();            
            req.flash('success', `Product successfully added to cart. See <a href='/cart'>here</a>`);
            }
        else {
            let i  = cart.items.findIndex((e) => e.id.equals(product._id));
            // console.log(i,product._id, cart.items[i]);
            if(i === -1){
                cart.items.push(newItem);
                cart.totalPrice += qty * price;
                cart.totalQty +=  qty;
                cart.save();
                req.flash('success', ` New product successfully added to cart. See <a href='/cart'>here</a>` );   
            }
            else{
                let preQty = qty - cart.items[i].quantity;
                cart.items[i].quantity = qty;
                cart.totalPrice += preQty * price;
                cart.totalQty += preQty;
                cart.save();
                req.flash('success', `Product successfully updated in cart. See <a href='/cart'>here</a>`);
            }
        }
        return res.redirect('back');
    }
    
    catch(err){
        req.flash('error',err.message);
        return res.redirect('back');
    }
});

router.get('/checkout', middleware.isLoggedIn, async function(req, res, next) {
    let cart = await Cart.findById(req.user.cart.id);
    if (cart === null || cart.items.length === 0) {
        req.flash('error','No product in cart. Please add some products first');
        return res.redirect('/products');
    }
    // let cart = new Cart(req.session.cart);
    // req.flash('error','error happened in payment process');
    res.render('cart/checkout', {total: cart.totalPrice, cart: cart});
});
    
// router.get('/:productId',middleware.isLoggedIn, function(req, res) {
//     let cart = new Cart(req.session.cart ? req.session.cart : {});
    
//     Product.findById(req.params.productId,function(err,foundProduct){
//         if(err){
//             req.flash('error', err.message);
//             return res.redirect('back');
//         }
//         else if(foundProduct === null){
//             req.flash('error', 'No product found');
//             return res.redirect('back');
//         }
//         else{
//             cart.add(foundProduct, foundProduct.id);
//             req.session.cart = cart;
//             req.flash('success',`product added to cart. see <a href='/cart/'>here</a>`);
//             res.redirect(`/products/${foundProduct.id}`);
//         }
//     });
// });

// router.get('/reduce/:productId', function(req, res, next) {
//     var cart = new Cart(req.session.cart ? req.session.cart : {});
//     cart.reduceByOne(req.params.productId);
//     req.session.cart = cart;
//     res.redirect('/cart');
// });

// router.get('/remove/:productId', function(req, res, next) {
//     var cart = new Cart(req.session.cart ? req.session.cart : {});

//     cart.removeProduct(req.params.productId);
//     req.session.cart = cart;
//     res.redirect('/cart');
// });


// router.get('/checkout',function(req, res) {
//     res.render('cart/checkout');
// });
    
    
module.exports = router;
