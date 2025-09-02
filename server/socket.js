module.exports = {
    connect: (io) => {
        const channelChat = io.of('/channelChat');

        channelChat.on('connection', (socket) => {
            console.log('[socket] connected: ', socket.id);

            // Function to count user numbers to emit immediately when user joins or leaves
            const emitCount = (channelId) => {
                const room = channelChat.adapter.rooms.get(channelId);
                const size = room ? room.size : 0;
                channelChat.to(channelId).emit('userNum', {channelId, userNum: size});
            }
            // Event to send message back to all users in the same channel room
            socket.on('joinChannel', ({channelId, senderName}) => {
                socket.join(channelId);
                socket.emit('joined', { channelId, senderName, socketId: socket.id });
                socket.to(channelId).emit('notice', `${senderName} has joined this channel.`);
                emitCount(channelId);  // Emit immediately after joining
            });
       
            // Event to leave a channel room
            socket.on('leaveChannel', ({channelId, senderName}) => {
                socket.leave(channelId);
                socket.emit('left', { channelId, senderName, socketId: socket.id });
                socket.to(channelId).emit('notice', `${senderName} has left this channel.`);
                emitCount(channelId);  // Emit immediately after leaving
            });
      
            // Broadcast message to specific channel room
            socket.on('chatMsg', ({channelId, sender, message}) => {
                channelChat.to(channelId).emit('chatMsg', {channelId, sender, message, timestamp: Date.now()});
            })

            // Event to count users in a channel room
            socket.on('reqUserNum', (channelId) => {
                const room = channelChat.adapter.rooms.get(channelId);
                const size = room ? room.size : 0;
                socket.emit('userNum', {channelId, userNum: size});
            })

            // Event to handle disconnection
            socket.on('disconnect', () => {
                console.log('User disconnected from channelChat namespace');
            });
       
        })
       
    }
}





