const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const express = require('express');
const userRouter = express.Router();
const FriendRequest = require('../models/FriendRequest');

userRouter.get('/chats/:id', async (req, res) => {
try {
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).send('User not found');
    }
    // Find all chats that the user is a participant in
    const chats = await Chat.find({
        participants: user._id
    }).populate('participants');

    res.send(chats);
} catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
}
}
);

userRouter.post('/createChat', async (req, res) => {
    try {
        const { userEmail, otherUserEmail } = req.body;
        console.log("Creating chat between:", userEmail, otherUserEmail);

        // Get the users by email (find their ObjectId)
        const [user, otherUser] = await Promise.all([
            User.findOne({ email: userEmail }),
            User.findOne({ email: otherUserEmail })
        ]);

        if (!user || !otherUser) {
            return res.status(404).send('One or both users not found');
        }

        // Check if a chat already exists between the two users
        const existingChat = await Chat.findOne({
            participants: { $all: [user._id, otherUser._id] } // Use ObjectIds here, not email
        });

        if (existingChat) {
            return res.send(existingChat); // Return existing chat if found
        }

        // Create and save the new chat
        const chat = new Chat({
            participants: [user._id, otherUser._id] // Use ObjectIds of users
        });
        await chat.save();

        console.log("New chat created with ID:", chat._id);

        // Update both users' chat lists with the new chat's ID
        await Promise.all([
            User.updateOne({ _id: user._id }, { $push: { chats: chat._id } }),
            User.updateOne({ _id: otherUser._id }, { $push: { chats: chat._id } })
        ]);

        const updatedUser = await User.findById(user._id).populate('chats');
        console.log("User chats after creating chat:", updatedUser.chats);

        res.send(chat); // Send the created chat as the response
    } catch (err) {
        console.error("Error in createChat:", err);
        res.status(500).send('Internal Server Error');
    }
});


userRouter.post('/change-notification', async (req, res) => {

    try {
        console.log("Changing notification status:", req.body);
        
        const { userId, notification } = req.body;
        
        
        console.log("Changing notification status:", userId, notification);

        const user = await User
            .findById(userId);

        if (!user) {
            return res.status(404).send('User not found');
        }

        await user.updateOne({ notifications: notification });

        res.json({ notifications: notification });
    } catch (err) {
        console.error("Error in changeNotification:", err);
        res.status(500).send('Internal Server Error');
    }
}
);


userRouter.get('/messages/:chatId', async (req, res) => {
try {
    const chat = await Chat.findById(req.params.chatId).populate('messages');
    if (!chat) {
        return res.status(404).send('Chat not found');
    }

    res.send(chat.messages);
}
catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
}
}
);

userRouter.get('/profile-picture/:id', async (req, res) => {
try {
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).send('User not found');
    }

    res.json({ profilePic: user.profilePic });
} catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
}
}
);

userRouter.post('/befriend', async (req, res) => {

    try {

        const { userId, friendId } = req.body;
        console.log("Adding friend:", userId, friendId);

        // Validate the existence of both users
        const [user, friend] = await Promise.all([
            User.findById(userId

            ),

            User.findById(friendId)
        ]);

        if (!user || !friend) {
            return res.status(404).json({error: 'One or both users not found'});
        }

        // Check if the users are already friends
        if (user.friends.includes(friend._id)) {
            return res.json({error: 'Already friends'});
        }
        
        const friendRequest = new FriendRequest({
            sender: userId,
            receiver: friendId
        });

        await friendRequest.populate([
            {path: 'sender', select: 'name _id profilePic'},
            {path: 'receiver', select: 'name _id profilePic'}
        ]);

        await friendRequest.save();

        

        // Add the friend to the user's friends list
        await user.updateOne({ $push: {  friendRequests: friendRequest._id} });
        await friend.updateOne({ $push: {  friendRequests: friendRequest._id} });

        

        console.log("User's friends after adding friend:", user.friends);

        res.json({ friendRequest: friendRequest });
    } catch (err) {
        console.error("Error in befriend:", err);
        res.status(500).json({error: 'Internal Server Error'});
    }
}
);

userRouter.post('/accept-friend-request', async (req, res) => {
    try {
        const { userId, friendRequestId } = req.body;
        console.log("Accepting friend request:", userId, friendRequestId);

        // Validate the existence of the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({error: 'User not found'});
        }

        // Find the friend request and the sender
        const friendRequest = await FriendRequest.findById(friendRequestId);
        const sender = await User.findById(friendRequest.sender);

        if (!friendRequest || !sender) {
            return res.status(404).json({error: 'Friend request or sender not found'});
        }

        // Check if the user is the receiver of the friend request
        if (friendRequest.receiver.toString() !== userId) {
            return res.json({error: 'Not the receiver of the friend request'});
        }

        // Check if the users are already friends
        if (user.friends.includes(sender._id)) {
            return res.json({error: 'Already friends'});
        }

        // Add the sender to the user's friends list
        await user.updateOne({ $push: { friends: sender._id } });
        await sender.updateOne({ $push: { friends: user._id } });

        // Remove the friend request
        await friendRequest.deleteOne();

        console.log("User's friends after accepting friend request:", user.friends);

        res.json({ friend: sender._id });
    } catch (err) {
        console.error("Error in acceptFriendRequest:", err);
        res.status(500).send('Internal Server Error');
    }
}
);

userRouter.post('/unfriend', async (req, res) => {
    try {
        const { userId, friendId } = req.body;
        console.log("Removing friend:", userId, friendId);

        // Validate the existence of both users
        const [user, friend] = await Promise.all([
            User.findById(userId),
            User.findById(friendId)
        ]);

        if (!user || !friend) {
            return res.status(404).send('One or both users not found');
        }

        // Check if the users are not friends
        if (!user.friends.includes(friendId)) {
            return res.json({error: 'Not friends'});
        }

        // Remove the friend from the user's friends list
        await user.updateOne({ $pull: { friends: friendId } });
        await friend.updateOne({ $pull: { friends: userId } });

        console.log("User's friends after removing friend:", user.friends);

        res.json({friend: friendId});
    } catch (err) {
        console.error("Error in unfriend:", err);
        res.status(500).send('Internal Server Error');
    }
}
);

userRouter.delete('/delete-friend-request/:id', async (req, res) => {
    try {
        const friendRequest = await FriendRequest.findById(req.params.id);
        if (!friendRequest) {
            return res.status(404).json({error: 'Friend request not found'});
        }

        await friendRequest.deleteOne();
        const user = await User.findById(friendRequest.receiver);
        await user.updateOne({ $pull: { friendRequests: friendRequest._id } });

        const sender = await User.findById(friendRequest.sender);
        await sender.updateOne({ $pull: { friendRequests: friendRequest._id } });

        console.log("Friend request deleted:", friendRequest._id);
        
        res.json({ friendRequest: friendRequest._id });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}
);

userRouter.get('/search/:name', async (req, res) => {
    console.log("Searching for users with name:", req.params.name);
    
    try {
        const users = await User.find({ name: { $regex: req.params.name, $options: 'i' },  accountStatus: 'active' })
        .select('name _id profilePic').populate(
            [
                {path: 'friends', select: 'name _id profilePic'},
                {path: 'posts', select: 'text mediaUrl contentType privacyStatus'},
                {path: 'friendRequests', populate: [{path: 'sender', select: 'name _id profilePic'},
                {path: 'receiver', select: 'name _id profilePic'}]}
            ]

        )
        console.log("Users found:", users);
        
        res.json({ users });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}
);


userRouter.get('/suggested-friends/:id', async (req, res) => {
    try {
        // Fetch the user and populate their friends along with their friends
        const user = await User.findById(req.params.id).populate({
            path: 'friends',
            populate: { path: 'friends', select: 'name _id posts likes dislikes' }
        });

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Sort user's friends by activity
        const mostActiveFriends = user.friends
            .sort((a, b) => (b.posts.length + b.likes.length + b.dislikes.length) - (a.posts.length + a.likes.length + a.dislikes.length))
            .slice(0, 3); // Take top 3 friends

        let suggestedFriends = [];
        let suggestedFriendsSet = new Set();

        // Find top 3 friends of the 3 most active friends
        for (let friend of mostActiveFriends) {
            const topFriendsOfFriend = friend.friends
                .sort((a, b) => (b.posts.length + b.likes.length + b.dislikes.length) - (a.posts.length + a.likes.length + a.dislikes.length))
                .slice(0, 3); // Take top 3 friends of each friend

            for (let friendOfFriend of topFriendsOfFriend) {
                // Exclude the user themselves, already friends, and duplicates
                if (
                    friendOfFriend._id.toString() !== user._id.toString() &&
                    !user.friends.some(existingFriend => existingFriend._id.toString() === friendOfFriend._id.toString()) &&
                    !suggestedFriendsSet.has(friendOfFriend._id.toString())
                ) {
                    suggestedFriends.push(friendOfFriend);
                    suggestedFriendsSet.add(friendOfFriend._id.toString());

                    // Stop collecting if we reach 9 suggestions
                    if (suggestedFriends.length === 9) {
                        break;
                    }
                }
            }

            if (suggestedFriends.length === 9) {
                break;
            }
        }

        console.log("Suggested friends:", suggestedFriends);
        res.json({ suggestedFriends });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

userRouter.delete('/delete/:id', async (req, res) => {

    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }

        await user.deleteOne();
        res.json({ user: user._id });
    } catch (err) {

        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}
);

userRouter.get('/all', async (req, res) => {
    try {
        const users = await User.find();
        res.json({ users });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}
);

userRouter.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
        .populate(
            [
                {path: 'friends', select: 'name _id profilePic'},
                {path: 'posts', select: 'text mediaUrl contentType privacyStatus'},
            ])
        ;
        console.log("User found:", user);
        
        if (!user) {
            return res.status(404).send('User not found');
        }

        res.json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}
);

module.exports = userRouter;
