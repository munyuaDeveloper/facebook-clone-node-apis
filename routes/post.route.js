const express  = require('express');
const Post = require('../models/post.model');
const User = require('../models/user.model')
const {promise} = require("bcrypt/promises");

const router = express.Router()

// Create Post
router.post('/', async (req, res)=> {
   try {
       const user = await User.findById(req.body.userId);
       if (!user) {
           return res.status(400).json("User id provided is not found")
       }
       const newPost = await new Post(req.body)

       const savedPost = await newPost.save();

       res.status(201).json(savedPost)
   }catch (e) {
       res.status(400).json(e)
   }
})

// Update Post
router.put('/:id', async (req, res)=> {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json("Post not found")
        }

        if (req.body.userId !== post.userId){
            return res.status(403).json("You can only update your posts")
        }
        const newPost = await Post.findByIdAndUpdate(req.params.id, {$set: req.body}, {new: true})

        res.status(200).json(newPost)
    }catch (e) {
        res.status(400).json(e)
    }
})

// Delete Post
router.delete('/:id', async (req, res)=> {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json("Post not found")
        }

        if (req.body.userId !== post.userId){
            return res.status(403).json("You can only delete your posts")
        }
         await Post.findByIdAndDelete(post._id)

        res.status(204).json('Post delete')
    }catch (e) {
        res.status(400).json(e)
    }
})

// Update likes
router.put('/:id/like', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        if (!post) {
            return  res.status(404).json('Post not found!')
        }

        if(!post.likes.includes(req.body.userId)) {
            await post.updateOne({$push: {likes: req.body.userId}});
            res.status(200).json('Liked!')
        }else {
            await post.updateOne({$pull: {likes: req.body.userId}});
            res.status(200).json('Disliked!')
        }
    }catch (e) {
        res.status(500).json(e)
    }
})

// Get single post
router.get('/:id', async (req, res)=> {
    try{
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json('Post not found')
        }

        res.status(200).json(post)
    }catch (e) {
        res.status(500).json(e)
    }
})

// Get timeline posts
router.get('/timeline/:id', async (req, res)=> {
    try{
        const currentUser = await User.findById(req.params.id);
        const userPosts = await Post.find({userId: currentUser._id})
        const friendPosts = await Promise.all(
            currentUser.followings.map((friendId)=> {
               return  Post.find({userId: friendId})
            })
        )
        res.status(200).json(userPosts.concat(...friendPosts))

    }catch (e) {
        res.status(500).json(e)
    }
})
module.exports = router;
