const express = require('express')
const bcrypt = require('bcrypt')
const User = require('../models/user.model')
const router = express.Router()

// Update user
router.put('/:id', async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt)
            }catch (e) {
                res.status(500).json(e)
            }
        }
        try {
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            }, {
                new: true
            })

            res.status(200).json(user)
        }catch (e) {
            res.status(500).json(e)
        }
    }else{
        res.status(403).json('You can only update your account')
    }
})

// Delete user
router.delete('/:id', async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            const user = await User.findByIdAndDelete(req.params.id)

            res.status(204).json(user)
        }catch (e) {
            res.status(500).json(e)
        }
    }else{
        res.status(403).json('You can only delete your account')
    }
})

// Get user details
router.get('/:id', async (req, res) => {
    if (req.params.id) {
        try {
            const user = await User.findById(req.params.id)
            !user && res.status(404).json('No user found with that Id')

            const {password, updatedAt, ... others} = user._doc;
            res.status(200).json(others)
        }catch (e) {
            res.status(404).json('No user found with that Id')
        }
    }else{
        res.status(403).json('You can only delete your account')
    }
})


// Update followers
router.put('/:id/follow', async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id)
            const currentUser = await User.findById(req.body.userId);

            if (!user || !currentUser) {
               return  res.status(404).json('User not found!')
            }

            if(!user.followers.includes(req.body.userId)) {
                await user.updateOne({$push: {followers: req.body.userId}});
                await currentUser.updateOne({$push: {followings: req.params.id}});

                res.status(200).json('User has been followed!')
            }else {
                res.status(403).json('You are already following this user')
            }

            res.status(200).json(user)
        }catch (e) {
            res.status(500).json('something went wrong')
        }
    }else{
        res.status(403).json('You can not follow yourself!')
    }
})

// Unfollow
router.put('/:id/unfollow', async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id)
            const currentUser = await User.findById(req.body.userId);

            if (!user || !currentUser) {
                return  res.status(404).json('User not found!')
            }

            if(user.followers.includes(req.body.userId)) {
                await user.updateOne({$pull: {followers: req.body.userId}});
                await currentUser.updateOne({$pull: {followings: req.params.id}});

                res.status(200).json('User has been unfollowed!')
            }else {
                res.status(403).json('You are already unfollowed this user')
            }

            res.status(200).json(user)
        }catch (e) {
            res.status(500).json('something went wrong')
        }
    }else{
        res.status(403).json('You can not unfollow yourself!')
    }
})

module.exports = router;
