const express = require('express')

const bcrypt = require('bcrypt')

const User = require('../models/user.model')

const router = express.Router()

// REGISTRATION
router.post('/register', async (req, res) => {
    try {
        let {username, email, password } = req.body;

        const salt  = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt)

        const newUser = await new User({
            username,
            email,
            password
        })
        const user = await newUser.save()

        res.status(200).json(user)

    }catch (e) {
        res.status(500).json(e)
    }
})

// LOGIN
router.post('/login', async (req, res) => {
    try {
       const user = await User.findOne({email: req.body.email})

        !user && res.status(404).json('User doesn\'t exist!')

        const validPassword = await bcrypt.compare(req.body.password, user.password)

        !validPassword && res.status(404).json('Wrong credentials!')

        res.status(200).json(user)

    }catch (e) {
        res.status(500).json(e)
    }
})

module.exports = router;
