const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

function useChatNamespace(io) {
  const chatnamespace = io.of('/chat');

  chatnamespace.on('connection', (socket) => {
    console.log('User connected to chat namespace:', socket.id);

    const userId = socket.handshake.auth.userId;
    if (!userId) {
      socket.emit('error', { message: 'User ID is required.' });
      return;
    }

    socket.join(userId);
    console.log(`User ${userId} joined the chat namespace`);

    socket.on('join_chat', async (chatId) => {
      console.log('Joining chat:', chatId);

      try {
        const chat = await Chat.findById(chatId);
        if (chat) {
          socket.join(chatId); // Join the specific chat room
          console.log(`User joined chat: ${chatId}`);
        } else {
          console.log('Chat not found');
        }
      } catch (err) {
        console.error(err);
      }
    });

    socket.on('get-chats', async (userId) => {
      try {
        const user = await User.findById(userId).populate({
          path: 'chats',
          populate: { path: 'participants', select: 'name isOnline' },
        });

        if (!user) {
          console.log(`User with ID ${userId} not found.`);
        } else {
          socket.emit('get-chats', user.chats);
        }
      } catch (err) {
        console.error('Error in get-chats:', err);
      }
    });

    socket.on('send_message', async (chatId, content, senderId) => {
      try {
        console.log(`Sending message to chat ${chatId}: ${content} from ${senderId}`);

        const chat = await Chat.findById(chatId);
        const receiver = chat.participants.find((p) => p.toString() !== senderId);
        const receiverUser = await User.findById(receiver);
        console.log("Receiver user is: ", receiverUser.isOnline);
        
        console.log("Receiver", receiverUser);
        
          console.log("Chat", chat);
          
        if (chat) {
          const message = new Message({
            content,
            sender: senderId,
            receiver,
            chat: chatId, // Store only the chat ID here
            status: receiverUser.isOnline ? 'delivered' : 'sent',
          });



          console.log('Message created:', message);
          

          // Save the new message to the database
          await message.save();
          // console.log('Message saved:', message);

          // Add the message to the chat's messages array in the database
          await chat.updateOne({ $push: { messages: message._id } });

          const sender = await User.findById(senderId).select('name');
          // Fetch the chat with updated messages and populate required fields
          const updatedMessages = await Message.find({ chat: chatId })
            .select('content sender receiver timestamp status chat')
            .populate([{ path: 'sender', select: 'name' }, { path: 'receiver', select: 'name' }]);

          console.log('Updated chat messages:', updatedMessages);

          const notification = new Notification({
            user: receiver,
            notificationType: 'message',
            notificationMessage: `${sender.name} sent you a message.`,
          });

          await Notification.create(notification);

          chatnamespace.to(receiver.toString()).emit('new-notification', notification);
          // Emit the updated messages array to participants in the chat room
          chatnamespace.to(chatId).emit('new_message', message);

          // Update the sender and receiver's chat arrays
          await User.updateOne({ _id: senderId }, { $addToSet: { chats: chat._id } });
          await User.updateOne({ _id: message.receiver }, { $addToSet: { chats: chat._id } });

          console.log(`Message sent to chat ${chatId}: ${content} from ${senderId}`);
        } else {
          console.log('Chat not found');
        }
      } catch (err) {
        console.error(err);
      }
    });

    socket.on('get-online-users', async () => {
      try {
        const onlineUsers = await User.find({ isOnline: true }).select('_id name');
        console.log('Online users:', onlineUsers);
        socket.emit('get-online-users', onlineUsers);
      } catch (err) {
        console.error(err);
      }
    });

    socket.on('get-messages', async (chatId) => {
      try {
        const messages = await Message.find({ chat: chatId })
          .select('content sender receiver timestamp status chat')
          .populate([
            { path: 'sender', select: 'name' },
            { path: 'receiver', select: 'name' },
          ]);
        console.log('Chat messages:', messages);
        socket.emit('get-messages', messages);
      } catch (err) {
        console.error(err);
      }
    });

    socket.on('update-messages-state', async (chatId, userId, state) => {
      try {
        console.log(`Marking messages as ${state} for chat ${chatId}`);

        const chat = await Chat.findById(chatId);
        console.log("Chat", chat);
        
        const receiver = chat.participants.find((p) => p.toString() !== userId);
        if (state === 'seen') {
        await Message.updateMany(
          { chat: chatId, sender: receiver, receiver: userId},
          { status: state }
        )
      } else if (state === 'delivered') {
        await Message.updateMany(
          { chat: chatId, sender: userId, receiver: receiver, status: 'sent' },
          { status: state }
        );
      }

        const updatedMessages = await Message.find({ chat: chatId })
          .select('content sender receiver timestamp status chat')
          .populate([
            { path: 'sender', select: 'name' },
            { path: 'receiver', select: 'name' },
          ]);

        console.log('Updated chat messages:', updatedMessages);

        chatnamespace.to(chatId).emit('update-messages-state', updatedMessages);
      } catch (err) {
        console.error(err);
      }
    });

    socket.on('update-user-state', async (userId, isOnline) => {
      try {
        console.log(`Updating user state for user ${userId}: ${isOnline}`);
        await User.updateOne({ _id: userId }, { isOnline });
        console.log('User state updated for user:', userId, 'to', isOnline);
      } catch (err) {
        console.error(err);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected from chat namespace');
    });
  });
}

module.exports = useChatNamespace;
