var express = require("express"),
    router  = express.Router(),
    passport = require("passport");

//require model
var User = require("../models/index.js");

//register routes
router.get("/register",function(req, res) {
    res.render('auth/register');
});

router.post('/register',function(req,res){
    //fetch user info
    var firstName=req.body.firstName,
        lastName = req.body.lastName,
        mobile= req.body.mobile,
        email = req.body.email,
        password = req.body.password,
        newsConsent = req.body.newsConsent;
        
    var userInfo = {firstName: firstName, lastName: lastName, mobile: mobile, email:email, newsConsent: newsConsent };
    
    //register and create user
    User.register(new User(userInfo), password, function(error, userCreated)
     {
         if (error)
         {
            console.log(error);    
            //  req.flash("error", error.message);
             return res.render("auth/register");
         }
         else
         {
             req.login(userCreated, function(err) {
              if (err) {
                console.log(err);
                return next(err);
              }
              console.log(userCreated);
              return res.redirect('/');
            });
         }
     });
});

//login routes
router.get('/login',function(req, res) {
    res.render('auth/login');
});

router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/",
        failureRedirect: "/register"
    }), function(req, res){
        console.log(req.body);
});

router.get('/logout',function(req, res) {
    req.logout();
    req.flash("success", "successfully logged out");
    res.redirect("/products"); 
});

router.get('/forget',function(req,res){
   res.render('auth/forget'); 
});

router.post('/forget', function(req,res){
    var email = req.body.email ;    
    var token = function(){
        var str = '';
        for(var i = 0; i< 6; i++){
        str += Math.floor(Math.random() * 10);
        return str;
    }};
    
    //mail this token to user
    res.redirect('/reset');
});

router.get('/reset',function(req, res) {
    res.render('auth/resetPass');
});

router.post('/reset',function(req, res) {
   var resetCode = req.body.resetCode ,
        newPasssword = req.body.newPasssword ;
        
        // authenticate that token is associated with given mail id
        //update the password
});

module.exports = router ;






