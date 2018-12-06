const express = require("express"),
    router    = express.Router(),
    crypto    = require("crypto"),
    async     = require("async"),
    nodemailer= require("nodemailer"), 
    passport  = require("passport");
    
    
//require model
const User = require("../models/index.js");

//index route
router.get('/',function (req,res) {
    res.render("index");
});

//register routes
router.get("/register",function(req, res) {
    res.render('auth/register');
});

router.get('/sgadmin',function(req, res) {
    res.render('auth/admin');
});

router.post('/register',function(req,res){
    //fetch user info
    let firstName=req.body.firstName,
        lastName = req.body.lastName,
        mobile= req.body.mobile,
        username = req.body.username,
        password = req.body.password,
        newsConsent = req.body.newsConsent;
    
    let userInfo = new  User({firstName: firstName, lastName: lastName, mobile: mobile, username:username, newsConsent: newsConsent });
      if(req.body.adminCode === process.env.ADMIN_CODE && req.body.adminCode !== ''){
        userInfo.isAdmin = true;
      }
    //register and create user
    User.register(userInfo, password, function(error, userCreated)
     {
         if (error)
         {
             req.flash("error", error.name +", " + error.message);
             return res.redirect("/register");
         }
         else
         {
            passport.authenticate("local")(req, res, function()
            {
              if (req.session.oldUrl) {
                var urltoForward = req.session.oldUrl;
                req.session.urltoForward = null;
              }  
               let transporter = nodemailer.createTransport(
                    {
                        host: 'smtp.stackmail.com',
                        port: 465,
                        secure: true, // true for 465, false for other ports
                        auth:
                        {
                            user: 'gs@nintia.in', // generated ethereal user
                            pass: process.env.MY_EMAIL_PASS // generated ethereal password
                        }
                    });
              var mailOptions = {
                to: userCreated.username,
                from: 'gs@nintia.in',
                subject: 'welcome to spargen',
                text: 'Hello ' + userCreated.firstName +" " + userCreated.lastName +'\n\n' +
                  'thanks for register with Spargen' +
                  " let's  make this journey memorable \n "
                + '\n Team Spargen'          
              };
              transporter.sendMail(mailOptions, function(err) {
                if(err){
                  req.flash('error','please provide a valid email id');
                }});
                //notify developer when an admin is added
                if(userCreated.isAdmin === true){
                   let mailToDev = {
                        to: 'gskumawat555@gmail.com',
                        from: 'gs@nintia.in',
                        subject: 'admin user is added to spargen',
                        text: ` a user with credentials below is added to spargen.
                        if not authorized remove him 
                        credentials ; -
                        name  : ${userCreated.firstName} ${userCreated.lastName}
                        email : ${userCreated.username},
                        date  : ${userCreated.date}`        
                      };
                      transporter.sendMail(mailToDev, function(err) {
                        if(err){
                          req.flash('error','please provide a valid email id');
                        }
                  
                });
                req.flash("success", "welcome!! onboard. you are a admin now. nice to meet you " + req.body.username);
              } else {
                req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
              }
              res.redirect(urltoForward || '/products');
            });
         }
     });
});

//login routes
router.get('/login',function(req, res) {
    res.render('auth/login');
});

router.post('/login',
  passport.authenticate('local',
    {
        failureRedirect: '/login',
        failureFlash: 'Invalid username or password.'
    }), function (req, res, next) {
          if (req.session.oldUrl) {
              var urltoForward = req.session.oldUrl;
              req.session.urltoForward = null;
              res.redirect(urltoForward);
          } else {
            req.flash('success','Nice to see you back'); 
            res.redirect('/products');
          }
});

router.get('/logout',function(req, res) {
    req.logout();
    req.flash("success", "successfully logged out");
    res.redirect("/"); 
});

// forgot password
router.get('/forgot', function(req, res) {
  res.render('auth/forgot');
});

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ username : req.body.username}, function(err, user) {
        if(err){
           req.flash('error', err.message);
           return res.redirect('/forgot'); 
        }
        if (!user) {
          req.flash('error', 'No account with email '+ req.body.username +'address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 600000; // 10 minutes

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      let smtpTransport = nodemailer.createTransport(
        {
            host: 'smtp.stackmail.com',
            port: 465,
            secure: true, // true for 465, false for other ports
            auth:
            {
                user: 'gs@nintia.in', // sender account
                pass: process.env.MY_EMAIL_PASS //  account key
            }
        });
      var mailOptions = {
        to: user.username,
        from: 'gs@nintia.in',
        subject: 'Spargen Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'https://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        + 'this token is valid for 10 minutes. \n\n'
        + 'Team Spargen'
          
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'An e-mail has been sent to ' + user.username + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if(err){
        req.flash('error', err.message);
        return res.redirect('/forgot');
    }
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('auth/reset', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if(err){
                req.flash('error', err.message);
                return res.redirect('/forgot');
            }
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.newPassword === req.body.confirmNewPassword) {
          user.setPassword(req.body.newPassword, function(err) {
            if(err){
                    req.flash('error', err.message);
                    return res.redirect('/forgot');
                }
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
                if(err){
                        req.flash('error', err.message);
                        return res.redirect('/forgot');
                    }
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          });
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
     let transporter = nodemailer.createTransport(
            {
                host: 'smtp.stackmail.com',
                port: 465,
                secure: true, // true for 465, false for other ports
                auth:
                {
                    user: 'gs@nintia.in',
                    pass: process.env.MY_EMAIL_PASS 
                }
            });
      var mailOptions = {
        to: user.username,
        from: 'gs@nintia.in',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.username + ' has just been changed.\n'
         + 'if this is not done by you, please report to admin at spargen.official@gmail.com'
        
        + '\n Team Spargen'          
      };
      transporter.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
      if(err){
          req.flash('error',err.message);
          res.redirect('/');
      }
    res.redirect('/');
  });
});




module.exports = router ;






