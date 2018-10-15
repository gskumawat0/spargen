//add dependencies
var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    session         = require("express-session"),
    nodemailer      = require("nodemailer"),
    mongoose        = require("mongoose"),
    flash           = require("connect-flash"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local").Strategy;
    
// add schema models
var User            = require("./models/index");    
//add routes
var indexRoutes = require("./routes/index.js");


var mongodburl = process.env.DATABASEURL || "mongodb://localhost/yelp_camp_v10";

mongoose.set('useCreateIndex', true);
mongoose.connect(mongodburl,{ useNewUrlParser: true });
// configure express
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));   
app.use(flash());


//add session
app.use(session(
{
    secret: "xcvbhgrporumvuktxtewcdzeazbztnofrxsehssudsdivfufmuslxtsxmbxtddxjhcyud",
    resave: false,
    saveUninitialized: false,
}));

//authorization
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) return done(err);
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.get('/',function (req,res) {
    res.render("index");
});

app.use(indexRoutes);
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