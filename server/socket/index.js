const Message = require('../models/Message');

function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // join a personal room for notifications
    socket.on('join_user', (userId) => {
      socket.join(`user_${userId}`);
    });

    // join a booking chat room
    socket.on('join_room', ({ bookingId }) => {
      socket.join(`booking_${bookingId}`);
    });

    // leave a booking chat room
    socket.on('leave_room', ({ bookingId }) => {
      socket.leave(`booking_${bookingId}`);
    });

    // send message
    socket.on('send_message', async ({ bookingId, senderId, content, messageType, senderName, senderImage }) => {
      try {
        const message = await Message.create({
          bookingId, senderId, content, messageType: messageType || 'text',
        });

        const payload = {
          _id: message._id,
          bookingId,
          senderId: { _id: senderId, name: senderName, profileImage: senderImage },
          content,
          messageType: message.messageType,
          isRead: false,
          sentAt: message.sentAt,
        };

        io.to(`booking_${bookingId}`).emit('receive_message', payload);
      } catch (err) {
        console.error('Socket send_message error:', err);
      }
    });

    // typing indicators
    socket.on('typing', ({ bookingId, userId }) => {
      socket.to(`booking_${bookingId}`).emit('user_typing', { userId });
    });

    socket.on('stop_typing', ({ bookingId, userId }) => {
      socket.to(`booking_${bookingId}`).emit('user_stop_typing', { userId });
    });

    // message read
    socket.on('message_read', ({ bookingId, userId }) => {
      socket.to(`booking_${bookingId}`).emit('messages_read', { userId });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

module.exports = setupSocket;
