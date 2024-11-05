const express = require('express');
const {sendOTP} = require('./sendOTP.js');
const User = require('../Models/Users.js');
const router = express.Router();

router.post('/sendOTP', async (req, res) => {
    const {name,email} = req.body;
    // console.log(name,email)
    let user = await User.findOne({email});
    if(user){
        return res.status(400).send({message:'User already exists'})
    }
    const digits ='0123456789';
    let otp='';
    for(let i=0;i<6;i++){
        otp+=digits[Math.floor(Math.random()*10)]
    }

    const result = sendOTP(name,email,otp);
    // console.log(result)
    res.status(200).send({otp:otp,message:'OTP sent successufully !!!'})
});

module.exports = router;