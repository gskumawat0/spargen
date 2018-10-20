//add dependencies
const express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    session         = require("express-session"),
    nodemailer      = require("nodemailer"),
    mongoose        = require("mongoose"),
    flash           = require("connect-flash"),
    passport        = require("passport"),
    LocalStrategy   = require('passport-local');

    
// add schema models
const User            = require("./models/index");    
//add routes
const indexRoutes = require("./routes/index.js"),
      productRoutes = require("./routes/products");


let mongodburl = process.env.DATABASEURL || "mongodb://localhost/spargen";

mongoose.connect(mongodburl,{ useNewUrlParser: true });
// configure express
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));   
app.use(flash());
//add session
app.use(session(
{
    secret: "xcvbhgrptddxjhcyud",
    resave: false,
    saveUninitialized: false,
}));

//authorization
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(function(User, done)
{
    done(null, User.id);
});
passport.deserializeUser(function(id, done)
{
    User.findById(id, function(err, user)
    {
        done(err, user);
    });
});

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.use(indexRoutes);
app.use('/products',productRoutes);
app.get("/product/:productId/",function(req,res){
   res.render('single'); 
});

app.get("/single", function(req, res) {
    res.render("product/single");
});

app.get('/contact',function(req, res) {
    res.render('contact/mail');
});

app.get('/checkout',function(req, res) {
    res.render('cart/checkout');
});

// accept all unspecified request
app.get('*',function(req, res) {
    res.render('error');
})

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The Server Has Started!");
});

