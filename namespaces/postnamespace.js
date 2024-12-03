const Post = require('../models/Post');
const User = require('../models/User');
const CommentText = require('../models/CommentText');
const Like = require('../models/Like');
const Dislike = require('../models/Dislike');
const Notification = require('../models/Notification');
const Story = require('../models/Story');
const fs = require('fs');
const path = require('path');

function usePostNamespace(io) {
    const postNamespace = io.of('/posts'); // Create a namespace for posts

    postNamespace.on('connection', (socket) => {
        console.log(`User connected to posts namespace: ${socket.id}`);

        const userId = socket.handshake.auth.userId;
        if (!userId) {
            socket.emit('error', 'User ID is required');
            return;
        }

        socket.join(userId); // Join the room for the user's ID


        // Load all posts
        socket.on('loadPosts', async ({ userId, page = 1, limit = 10 }) => {
            try {
                const skip = (page - 1) * limit;
        
                // Track already sent post IDs for this socket
                if (!socket.sentPostIds) {
                    socket.sentPostIds = new Set();
                }
        
                // Get the user's friends list
                const user = await User.findById(userId).populate('friends', '_id');
                console.log("User", user);
                
                const friendIds = user.friends.map(friend => friend._id.toString());
        
                // Fetch posts based on privacy rules with pagination
                const posts = await Post.find({
                    $or: [
                        { privacyStatus: 'public',
                            
                         }, // Public posts
                        {
                            privacyStatus: 'friends only', // Friends-only posts
                            user: { $in: friendIds }, // Only from the user's friends
                        },
                        {
                            privacyStatus: 'private', // Private posts
                            user: userId, // Only the user's own posts
                        },
                    ],
                }).where('user').ne(userId) // Exclude the user's own posts
                    .sort({ uploadDate: -1 }) // Sort by upload date (newest first)
                    .skip(skip) // Skip the previous pages
                    .limit(limit) // Limit the number of results per page
                    .populate([
                        { path: 'user', select: 'name _id profilePic' },
                        { path: 'likes', populate: { path: 'user', select: 'name _id profilePic' } },
                        { path: 'dislikes', populate: { path: 'user', select: 'name _id profilePic' } },
                        { path: 'comments', populate:[
                            { path: 'user', select: 'name _id profilePic' },
                            {path: 'replies', populate: {path: 'user', select: 'name _id profilePic'}},
                        ]  },
                    ]).select('mediaUrl text contentType uploadDate privacyStatus shares isShared sharedBy');

                    console.log("Posts", posts);
                    
        
                // Filter out posts that have already been sent to the client
                const newPosts = posts.filter(post => !socket.sentPostIds.has(post._id.toString()));
        
                // Add new post IDs to the tracking set
                newPosts.forEach(post => socket.sentPostIds.add(post._id.toString()));
        console.log(socket.sentPostIds);
                    console.log("New posts:", newPosts);
                    
                // Emit the new posts and metadata back to the client
                postNamespace.to(userId).emit('postsLoaded', {
                    posts: newPosts,
                    currentPage: page,
                    totalPages: Math.ceil(
                        await Post.countDocuments({
                            $or: [
                                { privacyStatus: 'public' },
                                {
                                    privacyStatus: 'friends only',
                                    user: { $in: friendIds },
                                },
                                {
                                    privacyStatus: 'private',
                                    user: userId,
                                },
                            ],
                        }) / limit
                    ),
                });
            } catch (err) {
                console.error(err);
                socket.emit('error', 'Error loading posts');
            }
        });
        
        
        

        // Like a post
        socket.on('likePost', async ({ postId, userId }) => {
            try {
                // Fetch the post to be liked and populate necessary fields
                const post = await Post.findById(postId).populate({
                    path: 'likes',
                    populate: { path: 'user', select: 'name _id' },
                }
                    
                );

        
                console.log("Post to be liked:", post);
                const user = await User.findById(userId)
                .populate('likes') ;
                ;

                console.log("User to like post:", user);
                
                // Check if the user has already liked the post
                if (!post.likes.find(like => user.likes.includes(like.toString()))) {
                    console.log("User has not liked the post yet. Adding like...");
        
                    // Create a new like instance
                    const like = new Like({ user: userId, post: postId });
                    await Like.create(like); 
                    console.log("Like to be added:", like);
                    const likes = await Like.find({}); 
                    console.log("Likes in the db: ", likes);
                    

                    // Update the post by adding the like
                    const post = await Post.findById(postId);
                    console.log("Post to be updated:", post);
                    console.log("Post likes: ", post.likes);
                    console.log("Post dislikes: ", post.dislikes);
                    
                    
                    const updatedPost = await Post.findByIdAndUpdate(
                        postId,
                        { $push: { likes: like._id } },
                        { new: true } // This option returns the updated document
                    ).populate([
                        {path: 'user', select: 'name _id'},
                        { path: 'likes', select: 'user', populate: { path: 'user', select: 'name _id' } },
                        { path: 'dislikes',select: 'user', populate: { path: 'user', select: 'name _id' } },
                        { path: 'comments',select: 'user' , populate: { path: 'user', select: 'name _id' } },
                    ]);
        
                   
                    
                    const notification = new Notification({
                        user: post.user._id,
                        notificationType: 'like',
                        notificationMessage: `${user.name} liked your post`,
                    });
                    await Notification.create(notification);
                    console.log("Updated Post after liking:", updatedPost);
                    // Update the user with the new like
                    await User.updateOne({ _id: userId }, { $push: { likes: like._id } });
                    console.log("Post usr id:", post.user._id);
                    
                    postNamespace.to(post.user._id.toString()).emit('new-notification', notification);
                    // Emit the updated post to the relevant users via socket
                    postNamespace.to(userId).emit('postLiked', { postId, userId, like });
                    postNamespace.to(post.user._id).emit('postLiked', { postId, userId, like });
                } else {
                    console.log("User has already liked the post.");
                }
            } catch (err) {
                console.error(err);
                socket.emit('error', 'Error liking post');
            }
        });
        

        // Dislike a post
        socket.on('dislikePost', async ({ postId, userId }) => {
            console.log("Dislike post method reached to update post with postId " + postId + ' and user Id: ' + userId);

try {
    // Find the post by ID and populate necessary fields
    const post = await Post.findById(postId)
    .populate([
        { path: 'user', select: 'name _id profilePic' },
        { path: 'likes', select: 'user', populate: { path: 'user', select: 'name _id profilePic' } },
        { path: 'dislikes', select: 'user', populate: { path: 'user', select: 'name _id profilePic' } },
        { path: 'comments', select: 'user', populate: { path: 'user', select: 'name _id profilePic' } },
    ]);

    console.log("Post: ", post);

    const user = await User.findById(userId);
    console.log("User: ", user);

    // Create a new dislike for the story
    const dislike = new Dislike({ user: userId, post: postId });
    await Dislike.create(dislike);
    console.log("Dislike created");

    if (!post.dislikes.find(dislike => user.dislikes.includes(dislike._id))) {
        // Find the post by ID and update it to include the new dislike
        const updatedPost = await Post.findByIdAndUpdate(
            postId, // Story ID to find the document
            { $push: { dislikes: dislike._id } }, // Push the dislike ObjectId into the dislikes array
            { new: true } // Return the updated document
        ).populate([
            { path: 'user', select: 'name _id profilePic' },
            { path: 'likes', populate: { path: 'user', select: 'name _id profilePic' } },
            { path: 'dislikes', populate: { path: 'user', select: 'name _id profilePic' } },
            { path: 'comments', populate: { path: 'user', select: 'name _id profilePic' } },
        ]);

        // Log the updated post after disliking
        console.log("Updated Story after disliking:", updatedPost);

        // Update the user document with the new dislike
        await User.updateOne({ _id: userId }, { $push: { dislikes: dislike._id } });

        // Save the updated post
        await post.save();

        console.log("Story Id:", postId);

        // Emit notifications to relevant users
        postNamespace.to(userId).emit('postDisliked', { postId, userId, dislikeId: dislike });
        postNamespace.to(post.user._id).emit('postDisliked', { postId, userId, dislikeId: dislike });
    } else {
        console.log("Story already disliked");
    }
} catch (err) {
    console.error(err);
    socket.emit('error', 'Error disliking post');
}});

        

        // Add a comment to a post
        socket.on('addComment', async ({ postId, commentText, userId, parentId }) => {
            try {
                const comment = new CommentText({ text: commentText, user: userId, post: postId, parent: parentId? parentId : null });
                await comment.save();

                const parentComment = await CommentText.findById(parentId);
                if (parentComment) {
                    await CommentText.updateOne({ _id: parentId }, { $push: { replies: comment._id } });
                    await parentComment.save();
                }
                const post = await Post.findById(postId)
                .populate
                ([
                    {path: 'user', select: 'name _id'},
                    { path: 'likes', select: 'user', populate: { path: 'user', select: 'name _id' } },
                    { path: 'dislikes',select: 'user', populate: { path: 'user', select: 'name _id' } },
                    { path: 'comments',select: 'user' , populate:[
                        { path: 'user', select: 'name _id' },
                        {path: 'replies', populate: [
                            {path: 'user', select: 'name _id'},
                        ]
                        },
                        {path: 'likes', populate: { path: 'user', select: 'name _id' } },
                        {path: 'dislikes', populate: { path: 'user', select: 'name _id' } },
                    ]  },
                ])
                ;
                await Post.updateOne({user: post.user} ,{ $push: { comments: comment } });
                await post.save();  

                const populatedComment = await CommentText.findById(comment._id).populate([
                    {path: 'user', select: 'name _id profilePic'},
                    {path: 'post', populate: {path: 'user', select: 'name _id profilePic'}},
                    {path: 'replies', populate: {path: 'user', select: 'name _id profilePic'}},
                    {path: 'likes', populate: {path: 'user', select: 'name _id profilePic'}},
                    {path: 'dislikes', populate: {path: 'user', select: 'name _id profilePic'}},
                    
                ]);

                const notification = new Notification({
                    user: post.user._id,
                    notificationType: 'comment',
                    notificationMessage: `${populatedComment.user.name} commented on your post`,
                });
                await Notification.create(notification);
                console.log("Comment added:", populatedComment);

                postNamespace.to(post.user._id.toString()).emit('new-notification', notification);
                postNamespace.to(userId).emit('commentAdded', { postId, comment: populatedComment });
                postNamespace.to(post.user._id.toString()).emit('commentAdded', { postId, comment: populatedComment });
            } catch (err) {
                console.error(err);
                socket.emit('error', 'Error adding comment: ' + err);
            }
        });

        socket.on('getComments', async (postId) => {
            try {
                console.log("Getting comments for post with id:", postId);
                
                
                const comments = await CommentText.find({ post: {_id: postId}, parent: null }).populate([
                    {path: 'user', select: 'name _id'},
                    {path: 'post', populate: {path: 'user', select: 'name _id'}},
                    {path: 'replies', populate: {path: 'user', select: 'name _id profilePic'}},
                    {path: 'likes', populate: {path: 'user', select: 'name _id'}},
                    {path: 'dislikes', populate: {path: 'user', select: 'name _id'}},
                ]);
                postNamespace.to(userId).emit('commentsLoaded', { postId, comments });
            } catch (err) {
                console.error(err);
                socket.emit('error', 'Error loading comments');
            }
        });

        // Like a comment
        socket.on('unlikePost', async ({ postId, userId }) => {
            console.log("unliking post with id:", postId, 'by useR:', userId);
            
            try {
                const post = await Post.findById
                (postId)
                .populate
                ([
                    {path: 'user', select: 'name _id'},
                    { path: 'likes', select: 'user', populate: { path: 'user', select: 'name _id' } },
                    { path: 'dislikes',select: 'user', populate: { path: 'user', select: 'name _id' } },
                    { path: 'comments',select: 'user' , populate: { path: 'user', select: 'name _id' } },
                ])
                ;

                console.log("Post to be unliked:", post);
                const user = await User.findById(userId);
                const like = post.likes.find(like => user.likes.includes(like._id));
                console.log("Like to be removed:", like);
                
                if (like) {
                    await Post.updateOne({user: post.user} ,{ $pull: { likes: like._id } });
                    await User.updateOne({ _id: userId }, { $pull: { likes: like._id } });
                    await post.save();

                    const updatedPost = await Post.findById(post._id);
                    console.log("Post after unliking:",  updatedPost);
                    postNamespace.to(userId).emit('postUnliked', { postId, userId });
                    postNamespace.to(post.user._id).emit('postUnliked', { postId, userId });
                }
            } catch (err) {
                console.error(err);
                socket.emit('error', 'Error unliking post');
            }
        });

        socket.on('undislikePost', async ({ postId, userId }) => {
            try {
                const post = await Post.findById
                (postId)
                .populate
                ([
                    {path: 'user', select: 'name _id'},
                   
                ])
                ;
                console.log("Post to be undisliked:", post);
                const user = await User.findById(userId); 
                const dislike = post.dislikes.find(dislike => user.dislikes.includes(dislike._id));
                if (dislike) {
                    await Post.updateOne({user: post.user} ,{ $pull: { dislikes: dislike } });
                    await User.updateOne({ _id: userId }, { $pull: { dislikes: dislike } });
                    await post.save();

                    console.log("Post after undisliking:", post);
                    
                    postNamespace.to(userId).emit('postUndisliked', { postId, userId });
                    postNamespace.to(post.user._id).emit('postUndisliked', { postId, userId });
                }
            } catch (err) {
                console.error(err);
                socket.emit('error', 'Error unliking post');
            }
        });



        // Delete a post
        socket.on('deletePost', async (postId) => {
            try {

                console.log("Post Id to be deleted:", postId);
        
                
                const post = await Post.findByIdAndDelete(postId);
                console.log("Post to be deleted:", post);
                
                if (post) {
                    const commentatorsIds = post.comments.map(comment => comment.user._id);
                    const likersIds = post.likes.map(like => like.user._id);
                    const dislikersIds = post.dislikes.map(dislike => dislike.user._id);
                    const userIds = [...new Set([...commentatorsIds, ...likersIds, ...dislikersIds])];

                    await CommentText.deleteMany({ _id: { $in: post.comments._id } });
                    await Like.deleteMany({ _id: { $in: post.likes._id } });
                    await Dislike.deleteMany({ _id: { $in: post.dislikes._id } });
                    await User.updateMany({ _id: { $in: likersIds } }, { $pull: { likes:  {post: postId} } });
                    await User.updateMany({ _id: { $in: dislikersIds } }, { $pull: { dislikes: {post: postId} } });
                    await User.updateMany({ _id: { $in: commentatorsIds } }, { $pull: { comments: {post: postId} } });
                    await User.updateOne({ _id: post.user._id }, { $pull: { posts: postId } });
                
                    console.log("Post deleted after updates:", post);
                    
                   userIds.forEach(userId => postNamespace.to(userId).emit('postDeleted', postId));
                    postNamespace.to(post.user._id).emit('postDeleted', postId);
                    postNamespace.to(userId).emit('postDeleted', postId);
                }
            } catch (err) {
                console.error(err);
                socket.emit('error', 'Error deleting post');
            }
        });

        socket.on('deleteComment', async ({ postId, commentId }) => {
            try {
                const comment = await CommentText.findByIdAndDelete(commentId);

                if (comment) {
                    await Post.updateOne({ _id: postId }, { $pull: { comments: commentId } });
                    await User.updateOne({ _id: comment.user._id }, { $pull: { comments: commentId } });

                    console.log("Comment deleted:", comment);
                    const post = await Post.findById(postId).populate('user', 'name _id');
                    postNamespace.to(comment.user._id).emit('commentDeleted', { postId, commentId });
                    postNamespace.to(post.user._id).emit('commentDeleted', { postId, commentId });
                    postNamespace.to(userId).emit('commentDeleted', { postId, commentId });
                }

                else {
                    console.log("Comment not found");


                }
            } catch (err) {
                console.error(err);
                socket.emit('error', 'Error deleting comment');
            }
        }
        );

        socket.on('savePost', async (post) => {
            try {
                const existingPost = await Post.findById(post._id);
                if (existingPost) {
                    const updatedPost = await Post.findByIdAndUpdate
                    (post._id, post, { new: true });
                    console.log("Post updated:", updatedPost);
                    postNamespace.to(userId).emit('postSaved', updatedPost);

                }
            }
            catch (err) {
                console.error(err);
                socket.emit('error', 'Error saving post');
            }
        });

        socket.on('uploadStory', async (data) => {
            const { fileData, fileName, userId } = data;
            console.log("Uploading story with user id:", userId);
        
            try {
                // Validate inputs
                if (!fileData || !fileName || !userId) {
                    console.error('Missing required fields: fileData, fileName, or userId');
                    socket.emit('error', { message: 'Missing required fields' });
                    return;
                }
        
                // Convert file data (base64) to Buffer
                const buffer = Buffer.from(fileData, 'base64');
        
                // Define upload directory and ensure it exists
                const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
        
                // Generate a unique file path
                const filePath = path.join(uploadDir, `${Date.now()}-${fileName}`);
                const mediaUrl = `http://localhost:3000/uploads/${path.basename(filePath)}`;

                console.log("Media url:", mediaUrl);
                
        
                // Save the file to disk asynchronously
                await fs.promises.writeFile(filePath, buffer);
                console.log(`File saved at ${filePath}`);
        
                // Save story metadata to the database
                const story = new Story({
                    user: userId, // Associate story with the user
                    mediaUrl: mediaUrl,
                    createdAt: new Date(),
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
                });
        
                const savedStory = await story.save();
                console.log('Story saved to the database:', savedStory);
        
                // Notify the user and their friends about the new story
                socket.emit('storySaved', savedStory); // Notify the uploader
                const user = await User.findById(userId).populate('friends', '_id');
                if (!user) {
                    console.error('User not found');
                    socket.emit('error', { message: 'User not found' });
                    return;
                }
        
                user.friends.forEach(friend => {
                    socket.to(friend._id.toString()).emit('storySaved', savedStory); // Notify friends
                });
        
            } catch (error) {
                console.error('Error uploading story:', error);
                socket.emit('error', { message: 'Failed to upload story', error });
            }
        });

        
        socket.on('deleteStory', async (storyId) => {
            try {
                const story = await Story.findByIdAndDelete(storyId);
                if (story) {
                    console.log("Story deleted:", story);
                    const friends = await User.findMany({ _id: { $in: story.user.friends} });

                    console.log("Story user friends:", story.user.friends);
                    
                    postNamespace.to(userId).emit('storyDeleted', storyId);
                    friends.forEach(friend => postNamespace.to(friend._id).emit('storyDeleted', storyId));
                }
            } catch (err) {
                console.error(err);
                socket.emit('error', 'Error deleting story');
            }
        }
        );

        socket.on('likeStory', async ({ storyId, userId }) => {
            
            try {
                // Fetch the post to be liked and populate necessary fields
                const story = await Story.findById(storyId).populate({
                    path: 'likes',
                    populate: { path: 'user', select: 'name _id' },
                }
                    
                );

        
                console.log("Post to be liked:", post);
                const user = await User.findById(userId)
                .populate('likes') ;
                ;

                console.log("User to like post:", user);
                
                // Check if the user has already liked the post
                if (!story.likes.find(like => user.likes.includes(like.toString()))) {
                    console.log("User has not liked the post yet. Adding like...");
        
                    // Create a new like instance
                    const like = new Like({ user: userId, story: storyId });
                    await Like.create(like); 
                    console.log("Like to be added:", like);
                    const likes = await Like.find({}); 
                    console.log("Likes in the db: ", likes);
                    

                    // Update the post by adding the like
                    const story = await Story.findById(storyId);
                    console.log("Post to be updated:", story);
                    console.log("Post likes: ", story.likes);
                    console.log("Post dislikes: ", story.dislikes);
                    
                    
                    const updatedStory = await Story.findByIdAndUpdate(
                        storyId,
                        { $push: { likes: like._id } },
                        { new: true } // This option returns the updated document
                    ).populate([
                        {path: 'user', select: 'name _id profilePic'},
                        { path: 'likes', select: 'user', populate: { path: 'user', select: 'name _id' } },
                        { path: 'dislikes',select: 'user', populate: { path: 'user', select: 'name _id' } },
                        { path: 'comments',select: 'user' , populate: { path: 'user', select: 'name _id' } },
                    ]);
        
                   
                    
                    const notification = new Notification({
                        user: story.user._id,
                        notificationType: 'like',
                        notificationMessage: `${user.name} liked your story`,
                    });
                    await Notification.create(notification);
                    console.log("Updated Post after liking:", updatedPost);
                    // Update the user with the new like
                    await User.updateOne({ _id: userId }, { $push: { likes: like._id } });
                    console.log("Post usr id:", story.user._id);
                    
                    postNamespace.to(story.user._id.toString()).emit('new-notification', notification);
                    // Emit the updated post to the relevant users via socket
                    postNamespace.to(userId).emit('postLiked', { storyId, userId, like });
                    postNamespace.to(story.user._id).emit('postLiked', { storyId, userId, like });
                } else {
                    console.log("User has already liked the post.");
                }
            } catch (err) {
                console.error(err);
                socket.emit('error', 'Error liking post');
            }
        }
        );

        socket.on('unlikeStory', async ({ storyId, userId }) => {
            onsole.log("unliking post with id:", storyId, 'by useR:', userId);
            
            try {
                const story = await Story.findById
                (storyId)
                .populate
                ([
                    {path: 'user', select: 'name _id profilePic'},
                    { path: 'likes', select: 'user', populate: { path: 'user', select: 'name _id profilePic' } },
                    { path: 'dislikes',select: 'user', populate: { path: 'user', select: 'name _id profilePic' } },
                    { path: 'comments',select: 'user' , populate: { path: 'user', select: 'name _id profilePic' } },
                ])
                ;

                console.log("Story to be unliked:", story);
                const user = await User.findById(userId);
                const like = story.likes.find(like => user.likes.includes(like._id));
                console.log("Like to be removed:", like);
                
                if (like) {
                    await Story.updateOne({user: story.user} ,{ $pull: { likes: like._id } });
                    await User.updateOne({ _id: userId }, { $pull: { likes: like._id } });
                    await story.save();

                    const updatedStory = await Story.findById(story._id);
                    console.log("Story after unliking:",  updatedStory);
                    postNamespace.to(userId).emit('storyUnliked', { storyId, userId });
                    postNamespace.to(story.user._id).emit('storyUnliked', { storyId, userId });
                }
            } catch (err) {
                console.error(err);
                socket.emit('error', 'Error unliking post');
            }
        });


        socket.on('loadStories', async ({ userId}) => {
            try {
                const user = await User.findById(userId).populate('friends', '_id name profilePic');
                const friendIds = user.friends.map(friend => friend._id.toString());
                const stories = await Story.find({ user: { $in: friendIds } })
                    .sort({ createdAt: -1 })
                    .populate([
                        {path: 'user', select: 'name _id profilePic'},
                        {path: 'likes', populate: {path: 'user', select: 'name _id profilePic'}}
                    ]);

                    console.log("Stories loaded:", stories);
                    
                postNamespace.to(userId).emit('storiesLoaded', stories);
            } catch (err) {
                console.error(err);
                socket.emit('error', 'Error loading stories');
            }

        });

    socket.on('dislikeStory', async ({ storyId, userId }) => {
        console.log("Dislike story method reached to update story with storyId " + storyId + ' and user Id: ' + userId);

        try {
            // Find the story by ID and populate necessary fields
            const story = await Story.findById(storyId)
            .populate([
                { path: 'user', select: 'name _id' },
                { path: 'likes', select: 'user', populate: { path: 'user', select: 'name _id' } },
                { path: 'dislikes', select: 'user', populate: { path: 'user', select: 'name _id' } },
                { path: 'comments', select: 'user', populate: { path: 'user', select: 'name _id' } },
            ]);
        
            console.log("Story: ", story);
        
            const user = await User.findById(userId);
            console.log("User: ", user);
        
            // Create a new dislike for the story
            const dislike = new Dislike({ user: userId, story: storyId });
            await Dislike.create(dislike);
            console.log("Dislike created");
        
            if (!story.dislikes.find(dislike => user.dislikes.includes(dislike._id))) {
                // Find the story by ID and update it to include the new dislike
                const updatedStory = await Story.findByIdAndUpdate(
                    storyId, // Story ID to find the document
                    { $push: { dislikes: dislike._id } }, // Push the dislike ObjectId into the dislikes array
                    { new: true } // Return the updated document
                ).populate([
                    { path: 'user', select: 'name _id' },
                    { path: 'likes', populate: { path: 'user', select: 'name _id' } },
                    { path: 'dislikes', populate: { path: 'user', select: 'name _id' } },
                    { path: 'comments', populate: { path: 'user', select: 'name _id' } },
                ]);
        
                // Log the updated story after disliking
                console.log("Updated Story after disliking:", updatedStory);
        
                // Update the user document with the new dislike
                await User.updateOne({ _id: userId }, { $push: { dislikes: dislike._id } });
        
                // Save the updated story
                await story.save();
        
                console.log("Story Id:", storyId);
        
                // Emit notifications to relevant users
                postNamespace.to(userId).emit('storyDisliked', { storyId, userId, dislikeId: dislike });
                postNamespace.to(story.user._id).emit('storyDisliked', { storyId, userId, dislikeId: dislike });
            } else {
                console.log("Story already disliked");
            }
        } catch (err) {
            console.error(err);
            socket.emit('error', 'Error disliking story');
        }});

        socket.on('sharePost', async ({ postId, userId }) => {
            try {
              // Increment the share count and update sharedBy
              const updatedPost = await Post.findByIdAndUpdate(
                postId,
                {
                  $inc: { shares: 1 },
                  $addToSet: { sharedBy: userId }, // Ensure userId is stored in an array for tracking
                },
                { new: true } // Return the updated document
              ).populate([
                { path: 'user', select: 'name _id profilePic' },
                { path: 'likes', populate: { path: 'user', select: 'name _id profilePic' } },
                { path: 'dislikes', populate: { path: 'user', select: 'name _id profilePic' } },
                {
                  path: 'comments',
                  populate: [
                    { path: 'user', select: 'name _id profilePic' },
                    { path: 'replies', populate: { path: 'user', select: 'name _id profilePic' } },
                    { path: 'likes', populate: { path: 'user', select: 'name _id profilePic' } },
                    { path: 'dislikes', populate: { path: 'user', select: 'name _id profilePic' } },
                  ],
                },
              ]);
          
              if (!updatedPost) {
                return socket.emit('error', 'Post not found');
              }
          
              // Create a notification for the post owner
              const notification = await Notification.create({
                user: updatedPost.user._id, // Post owner's ID
                notificationType: 'share',
                notificationMessage: `${userId} shared your post`,
              });
          
              // Notify the post owner
              postNamespace.to(updatedPost.user._id.toString()).emit('new-notification', notification);
          
              // Notify the sharer's friends
              const sharer = await User.findById(userId).populate('friends', 'name _id profilePic');
              if (sharer && sharer.friends) {
                sharer.friends.forEach(friend => {
                  postNamespace.to(friend._id.toString()).emit('postShared', updatedPost);
                });
              }
            } catch (err) {
              console.error(err);
              socket.emit('error', 'Error sharing post');
            }
          });

          
          socket.on('addCommentStory', async ({ storyId, commentText, userId, parentId }) => {
            try {
                const comment = new CommentText({ text: commentText, user: userId, story: storyId, parent: parentId? parentId : null });
                await comment.save();

                const parentComment = await CommentText.findById(parentId);
                if (parentComment) {
                    await CommentText.updateOne({ _id: parentId }, { $push: { replies: comment._id } });
                    await parentComment.save();
                }
                const story= await Story.findById(storyId)
                .populate
                ([
                    {path: 'user', select: 'name _id profilePic'},
                    { path: 'likes', select: 'user', populate: { path: 'user', select: 'name _id profilePic' } },
                    { path: 'dislikes',select: 'user', populate: { path: 'user', select: 'name _id profilePic' } },
                    { path: 'comments',select: 'user' , populate:[
                        { path: 'user', select: 'name _id profilePic' },
                        {path: 'replies', populate: [
                            {path: 'user', select: 'name _id profilePic'},
                        ]
                        },
                        {path: 'likes', populate: { path: 'user', select: 'name _id profilePic' } },
                        {path: 'dislikes', populate: { path: 'user', select: 'name _id profilePic' } },
                    ]  },
                ])
                ;
                await Story.updateOne({user: story.user} ,{ $push: { comments: comment } });
                await story.save();  

                const populatedComment = await CommentText.findById(comment._id).populate([
                    {path: 'user', select: 'name _id profilePic'},
                    {path: 'story', populate: {path: 'user', select: 'name _id profilePic'}},
                    {path: 'replies', populate: {path: 'user', select: 'name _id profilePic'}},
                    {path: 'likes', populate: {path: 'user', select: 'name _id profilePic'}},
                    {path: 'dislikes', populate: {path: 'user', select: 'name _id profilePic'}},
                    
                ]);

                const notification = new Notification({
                    user: story.user._id,
                    notificationType: 'comment',
                    notificationMessage: `${populatedComment.user.name} commented on your story`,
                });
                await Notification.create(notification);
                console.log("Comment added:", populatedComment);

                postNamespace.to(story.user._id.toString()).emit('new-notification', notification);
                postNamespace.to(userId).emit('commentAddedStory', { storyId, comment: populatedComment });
                postNamespace.to(story.user._id.toString()).emit('commentAddedStory', { storyId, comment: populatedComment });
            } catch (err) {
                console.error(err);
                socket.emit('error', 'Error adding comment to story: ' + err);
            }
        });



            socket.on('disconnect', () => {
                console.log(`User disconnected from posts namespace: ${socket.id}`);
            });
            
        })
        // Disconnect handler
}

module.exports = usePostNamespace;
