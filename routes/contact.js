const express       = require("express"),
    router          = express.Router({mergeParams :true}),
    mongoose        = require("mongoose"),
    nodemailer      = require("nodemailer"),
    bodyParser      = require("body-parser");
    
const Mail  = require("../models/contact");    
// let smtpTransport = nodemailer.createTransport(
//                 {
//                     host: 'smtp.stackmail.com',
//                     port: 465,
//                     secure: true, // true for 465, false for other ports
//                     auth:
//                     {
//                         user: 'gs@nintia.in', // sender account
//                         pass: process.env.MY_EMAIL_PASS //  account key
//                     }
//                 });

router.get('/',function(req, res) {
    res.render('contact/mail');
});

router.post('/', async function(req,res){
    try{
            let result =  await Mail.create(req.body.contact);
            
            // var mailOptions = {
            //     to: result.email,
            //     from: 'gs@nintia.in',
            //     subject: 'your query',
            //     text: ''
              
            // };
            // smtpTransport.sendMail(mailOptions, function(err) {
            //     done(err, 'done');
            // });
            
            req.flash('success', ` Dear ${result.name}, we received your message. we will contact you soon.`);
            res.redirect('/');
    }
    catch(err){
        req.flash('error', err.message);
        res.redirect('back');
    }
});

module.exports = router;