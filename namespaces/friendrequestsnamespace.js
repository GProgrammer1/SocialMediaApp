const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');
const Notification = require('../models/Notification');

function useFriendRequestsNamespace(io) {
  // Create a dedicated namespace for friend requests
  const friendRequestsNamespace = io.of('/friend-requests');
console.log("Friend request namespace is: ", friendRequestsNamespace);

  friendRequestsNamespace.on('connection', async (socket) => {
    console.log('A user connected to the friend-requests namespace:', socket.id);

    // Authenticate the user and fetch their user ID
    console.log("Socket handshake auth is: ", socket.handshake.auth);
    
    const userId = socket.handshake.auth.userId;
    if (!userId) {
        socket.emit('error', { message: 'User ID is required.' });
        return;
    }

    


    socket.join(userId);
    console.log(`User ${userId} joined the friend-requests namespace`);
    console.log('Rooms after joining:', friendRequestsNamespace.adapter.rooms);
    const room = friendRequestsNamespace.adapter.rooms.get(userId);
    console.log("Room is: ", room);
    

    // Join a room based on the user's ID

    // Handle sending a friend request
    socket.on('send-friend-request', async ({ senderId, receiverId }) => {
      try {
        console.log("Sending friend request: ", { senderId, receiverId });
        
        const existingRequest = await FriendRequest.findOne({
          sender: senderId,
          receiver: receiverId,
        });

        if (existingRequest) {
          socket.emit('error', { message: 'Friend request already exists.' });
          return;
        }

        const friendRequest = new FriendRequest({ sender: senderId, receiver: receiverId });
        await friendRequest.populate([
            { path: 'sender', select: '_id name' },
            { path: 'receiver', select: '_id name' }
        ]);
        await friendRequest.save();

        console.log("Friend request is sent successfully: ", friendRequest);
        await User.findByIdAndUpdate(senderId, { $push: { friendRequests: friendRequest._id } });
        await User.findByIdAndUpdate(receiverId, { $push: { friendRequests: friendRequest._id } });


        const notification = new Notification({
            user: receiverId,
            notificationType: 'friend-request',
            notificationMessage: `${friendRequest.sender.name} sent you a friend request.`
        });
        
        await Notification.create(notification);
        // Notify the receiver about the new friend request
        friendRequestsNamespace.to(receiverId).emit('friend-request-received', 
          friendRequest
        );

        friendRequestsNamespace.to(receiverId).emit('new-notification', notification);

        friendRequestsNamespace.to(senderId).emit('friend-request-sent',
            friendRequest
        );


        console.log('Friend request sent:', { senderId, receiverId });
      } catch (err) {
        console.error('Error sending friend request:', err);
        socket.emit('error', { message: 'Failed to send friend request.' });
      }
    });

    // Handle accepting a friend request
    socket.on('accept-friend-request', async ({ requestId, receiverId }) => {
      try {
        const request = await FriendRequest.findById(requestId).populate([
            {path: 'sender',
            populate: {path: 'friends',
               populate: {path: 'posts', select: 'mediaUrl text privacyStatus'}}, select: '_id name'

             },
            {path: 'receiver', populate: {path: 'friends',
              populate: {path: 'posts', select: 'mediaUrl text privacyStatus'}}, select: '_id name'}
        ])
            ;
        if (!request) {
          socket.emit('error', { message: 'Friend request not found.' });
          return;
        }

        const { sender } = request; //ObjectID

        // Add friends to both users
        await User.findByIdAndUpdate(sender, { $addToSet: { friends: receiverId } });
        await User.findByIdAndUpdate(receiverId, { $addToSet: { friends: sender } });

        // Delete the friend request
        await FriendRequest.findByIdAndDelete(requestId);

        const notification = new Notification({
            user: sender,
            notificationType: 'friend-request',
            notificationMessage: `${request.receiver.name} accepted your friend request.`
        });

        await Notification.create(notification);  
        // Notify both users about the accepted friend request
        friendRequestsNamespace.to(sender._id.toString()).emit('friend-request-accepted', request);
        friendRequestsNamespace.to(receiverId).emit('friend-request-accepted', request);
        friendRequestsNamespace.to(sender._id.toString()).emit('new-notification', notification);

        console.log('Friend request accepted:', { sender, receiver: receiverId });
      } catch (err) {
        
        console.error('Error accepting friend request:', err);
        socket.emit('error', { message: 'Failed to accept friend request.' });
      }
    });

    socket.on('unfriend', async ({ userId, friendId }) => {
        try {
            // Remove the friend from the user's friends list
            await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });

            await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });

            console.log('User unfriended:', { userId, friendId });
            friendRequestsNamespace.to(userId).emit('unfriended', { userId, friendId });
            friendRequestsNamespace.to(friendId).emit('unfriended', { userId, friendId });
        } catch (err) {
            console.error('Error unfriending user:', err);
            socket.emit('error', { message: 'Failed to unfriend user.' });
        }
    });

    // Handle rejecting or canceling a friend request
    socket.on('remove-friend-request', async ({ requestId }) => {
      try {
        console.log("Request ID is: ", requestId);
        
        const request = await FriendRequest.findById(requestId).populate([
            {path: 'sender', select: '_id name'},   
            {path: 'receiver', select: '_id name'}
        ])
            ;
        if (!request) {
          socket.emit('error', { message: 'Friend request not found.' });
          return;
        }

        const { sender, receiver } = request;

        console.log("Sender is: ", sender);
        console.log("Receiver is: ", receiver); 
        
        // Remove the friend request from the database
        await FriendRequest.findByIdAndDelete(requestId);

        // Notify both users about the removed friend request
        friendRequestsNamespace.to(sender._id.toString()).emit('friend-request-removed', request);
        friendRequestsNamespace.to(receiver._id.toString()).emit('friend-request-removed', request);

        console.log('Friend request removed:', { sender, receiver });
      } catch (err) {
        console.error('Error removing friend request:', err);
        socket.emit('error', { message: 'Failed to remove friend request.' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected from friend-requests namespace:', socket.id);
    });
  });
}

module.exports = useFriendRequestsNamespace;
