const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

function useChatNamespace(io) {
    const chatnamespace = io.of('/chat');
    chatnamespace.on('connection', (socket) => {

    console.log('User connected to chat namespace:', socket.id);

    socket.on('join_chat', async (chatId) => {
        console.log('Joining chat:', chatId);
        
      try {
        // Check if the chat exists
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
              populate: { path: 'participants', select: 'name' }
          });

          console.log("User: ", user);
          
  
          console.log(user.chats);
          console.log(user.chats.participants);
          
          
          if (!user) {
              console.log(`User with ID ${userId} not found.`);
          } else {
              console.log("First chat participants:", JSON.stringify(user.chats[0]?.participants, null, 2));
              console.log("Participants: ", user.chats.participants);
              console.log("User with participants:" , JSON.stringify(user)) ;
          }
  
          socket.emit('get-chats', user.chats);
      } catch (err) {
          console.error("Error in get-chats:", err);
      }
      
  });
  
  

    // Event for sending a message
    socket.on('send_message', async (chatId, content, senderId) => {
      try {
        console.log(`Sending message to chat ${chatId}: ${content}`);
        
        const chat = await Chat.findById(chatId);

        if (chat) {
          const message = new Message({
            content,
            sender: senderId,
            receiver: chat.participants.find(p => p.toString() !== senderId), // Get the other participant
          });
  
          // Save the message to the database
          await message.save();
  
          // Add the message to the chat's messages array
          chat.messages.push(message._id);
          await chat.save();

          const user = await User.findById(senderId);
            user.chats.push(chatId);
            await user.save();

            const receiverUser = await User.findById(message.receiver);
            receiverUser.chats.push(chatId);
            await receiverUser.save();
   
          // Emit the message to both participants in the chat room
          chatnamespace.to(chatId).emit('new_message', message);
  
          console.log(`Message sent: ${message.content}`);
        } else {
          console.log('Chat not found');
        }
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
