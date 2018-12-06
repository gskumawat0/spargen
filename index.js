//add dependencies
const express       = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    session         = require("express-session"),
    mongoose        = require("mongoose"),
    flash           = require("connect-flash"),
    passport        = require("passport"),
    LocalStrategy   = require('passport-local'),
    methodOverride  = require("method-override"),
    MongoStore      = require("connect-mongo")(session);

require('dotenv').config();  
// add schema models
const User            = require("./models/index");    
//add routes
const indexRoutes = require("./routes/index.js"),
      productRoutes = require("./routes/products"),
      reviewRoutes  = require("./routes/reviews"),
      userRoutes    = require("./routes/users"),
      cartRoutes    = require("./routes/cart");


let mongodburl = process.env.DATABASEURL;

mongoose.connect(mongodburl,{ useNewUrlParser: true });
// configure express
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.use(flash());

app.locals.moment = require('moment');
//add session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection : mongoose.connection }),
    cookie: { maxAge:   6 * 30 * 24 * 60 * 60 * 1000 ,
            //   secure : true,
              expires: false
             } // 1 month but expires when you close the browser
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
   res.locals.session = req.session;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.use(indexRoutes);
app.use('/products',productRoutes);
app.use('/products/:productId/reviews', reviewRoutes);
app.use('/user/:userId', userRoutes);
app.use('/cart', cartRoutes);

app.get("/single", function(req, res) {
    res.render("product/single");
});

app.get('/contact',function(req, res) {
    res.render('contact/mail');
});


// accept all unspecified request
app.get('*',function(req, res) {
    res.render('error');
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The Server Has Started!");
});

