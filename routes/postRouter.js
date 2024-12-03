const express = require('express');
const postRouter = express.Router();

const multer = require('multer');
const path = require('path');
const Post = require('../models/Post');
const User = require('../models/User');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});


const upload = multer({
    storage: storage
});

postRouter.post('/create', upload.single('media'), async (req, res) => {
    try {
        const userId = req.body.user;
        console.log("User ID:", userId);
        
        const user = await User.findById(userId);

        let post = new Post({
            user: user._id,
            text: req.body.text,
            mediaUrl: req.file ?  `http://localhost:3000/uploads/${req.file.filename}` : null,
            contentType: req.file ? req.file.mimetype : 'text/plain',
            privacyStatus: req.body.privacyStatus
        });
        
       
        await Post.create(post);
        console.log("Post created:", post);

        
        
        const updatedPost = {
            _id: post._id,
            text: post.text,
            mediaUrl: post.mediaUrl,
            privacyStatus: post.privacyStatus
        };
        
       await  User.updateOne( {_id: user._id}, { $push: { posts: post._id } });
       let userWithUpdatedPosts = await User.findById(user._id)
       .populate({
           path: 'posts', // Path to the posts field
           select: 'mediaUrl text privacyStatus _id createdAt' // Select specific fields from the populated posts
       });       console.log("User with updated posts:", userWithUpdatedPosts);
       
        res.status(201).json({updatedUser: userWithUpdatedPosts, updatedPost: updatedPost});
    } catch (err) {
        console.error("Error saving file:" , err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE all posts
postRouter.delete('/deleteAll', async (req, res) => {
    try {
        // Delete all posts in the database
        const result = await Post.deleteMany({});
        
        // Optionally, you could delete posts from users' post arrays as well
        // await User.updateMany({}, { $pull: { posts: { $in: result.deletedIds } } });

        res.status(200).json({ message: 'All posts deleted successfully', deletedCount: result.deletedCount });
    } catch (err) {
        console.error("Error deleting posts:", err);
        res.status(500).json({ error: 'Server error' });
    }
});


postRouter.get('/:postId', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId)
        
        .populate([
            {path: 'user', select: 'name _id'},
            {path: 'comments', select: 'text user createdAt', populate: [
                {path: 'user', select: 'name _id profilePic'},
                {path: 'replies', select: 'text user createdAt', populate: {path: 'user', select: 'name _id profilePic'}},
                {path: 'likes', select: 'user', populate: {path: 'user', select: 'name _id'} },
                {path: 'dislikes', select: 'user', populate: {path: 'user', select: 'name _id'} }

            ]},
            {path: 'likes', select: 'user', populate: {path: 'user', select: 'name _id'} },
            {path: 'dislikes', select: 'user', populate: {path: 'user', select: 'name _id'} }

        ])
            ;

            console.log("Post:", post);
            
        res.status(200).json({post});
    } catch (err) {
        console.error("Error getting post:", err);
        res.status(500).json({ error: 'Server error' });
    }
});
module.exports = postRouter;