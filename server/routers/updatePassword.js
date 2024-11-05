const express = require('express');
const User = require('../Models/Users.js');
const bcrypt = require('bcrypt');
const router = express.Router();
const salt=10;


router.post('/updatePass', async (req, res) => {
    const {email,password } = req.body;
   const nPass=await bcrypt.hash(password, salt)
    try {
        let newUser=await User.findOne({email});
        if(newUser){
            await User.updateOne({email},{$set:{password:nPass}});
            return res.status(201).json({msg:'success'});
        }
        return res.status(400).json({msg:'User not found !'});

    } catch (err) {
        return  res.status(400).json({ msg: 'Error', error: err });
    }
});

module.exports = router;