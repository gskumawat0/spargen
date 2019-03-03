const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require('passport-local');
const methodOverride = require("method-override");
const MongoStore = require("connect-mongo")(session);

// add schema models
const User = require("./models/index");
const NewsLetter = require("./models/newsletter");

//add routes
const indexRoutes = require("./routes/index.js");
const productRoutes = require("./routes/products");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");
const cartRoutes = require("./routes/cart");
const adminRoutes = require("./routes/admin");
const contactRoutes = require("./routes/contact");


let mongodburl = process.env.DATABASEURL;
mongoose.connect(mongodburl, { useNewUrlParser: true, useCreateIndex: true });
mongoose.set('debug', true);
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
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: {
        maxAge: 6 * 30 * 24 * 60 * 60 * 1000,
    }
}));

//authorization
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(function(User, done) {
    done(null, User.id);
});
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.session = req.session;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(indexRoutes);
app.use('/products', productRoutes);
app.use('/products/:productId/reviews', reviewRoutes);
app.use('/user/:userId', userRoutes);
app.use('/cart', cartRoutes);
app.use('/admin', adminRoutes);
app.use('/contact', contactRoutes);


app.post('/newsletter', async function(req, res) {
    try {
        await NewsLetter.create(req.body.newsletter);
        req.flash('success', 'You subscribed to our weekly newsletter. Thank you!!');
        res.redirect('/');
    }
    catch (err) {
        req.flash('error', 'an error occured. please try again.');
    }

});

app.get("/single", function(req, res) {
    res.render("product/single");
});
app.get('/blogs', function(req, res) {
    res.render("product/single");
});


app.get('/about', function(req, res) {
    res.render('about/about');
});

app.get('/test', function(req, res, next) {
    res.render('admin/add');
})

// accept all unspecified request
app.get('*', function(req, res) {
    res.render('error');
});

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("The Server Has Started!");
});
