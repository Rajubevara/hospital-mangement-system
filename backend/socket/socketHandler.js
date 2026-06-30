import Message from '../models/Message.js';

export const handleSocketConnections = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket Connected: ${socket.id}`);

    // Join room based on user ID
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(userId);
        console.log(`User ${userId} joined room ${userId}`);
      }
    });

    // Real-time Chat Messaging
    socket.on('sendMessage', async ({ senderId, recipientId, content }) => {
      try {
        if (!senderId || !recipientId || !content) {
          return;
        }

        // Save message to database
        const message = await Message.create({
          sender: senderId,
          recipient: recipientId,
          content,
        });

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name avatar role')
          .populate('recipient', 'name avatar role');

        // Emit message to recipient's room
        io.to(recipientId).emit('messageReceived', populatedMessage);
        
        // Emit message back to sender
        io.to(senderId).emit('messageSent', populatedMessage);
      } catch (error) {
        console.error(`Socket message error: ${error.message}`);
      }
    });

    // WebRTC Signaling for Video Consultation
    
    // Call invite
    socket.on('callUser', ({ userToCall, signalData, from, name }) => {
      io.to(userToCall).emit('callIncoming', {
        signal: signalData,
        from,
        name,
      });
    });

    // Accept call
    socket.on('answerCall', ({ to, signal }) => {
      io.to(to).emit('callAccepted', signal);
    });

    // Reject / End call
    socket.on('endCall', ({ to }) => {
      io.to(to).emit('callEnded');
    });

    socket.on('disconnect', () => {
      console.log(`Socket Disconnected: ${socket.id}`);
    });
  });
};
