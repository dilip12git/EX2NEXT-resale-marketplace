const express = require('express');
const {sendResetPassOTP} = require('./sendResetPassOTP.js');
const User = require('../Models/Users.js');
const router = express.Router();

router.post('/sendResetPassOTP', async (req, res) => {
    const {email} = req.body;
    let user = await User.findOne({email});
    if(!user){
        return res.status(400).send({message:'User record not found !!'})
    }
    const digits ='0123456789';
    let otp='';
    for(let i=0;i<6;i++){
        otp+=digits[Math.floor(Math.random()*10)]
    }
   sendResetPassOTP(email,otp);
    // console.log(result)
    res.status(200).send({otp:otp,message:'OTP sent successufully !!!'})
});

module.exports = router;