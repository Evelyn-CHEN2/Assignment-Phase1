module.exports = {
    connect: (io) => {
        const channelChat = io.of('/channelChat');

        channelChat.on('connection', (socket) => {
            console.log('[socket] connected: ', socket.id);
            // Event to send message back to all users in the same channel room
            socket.on('joinChannel', (channelId) => {
                socket.join(channelId);
                socket.emit('joined', { channelId, socketId: socket.id });
                socket.to(channelId).emit('notice', `A new user has joined the channel: ${channelId}`);
            });
       
     

            // Event to leave a channel room
            socket.on('leaveChannel', (channelId) => {
                socket.leave(channelId);
                socket.to(channelId).emit('notice', `A user has left the channel: ${channelId}`);
            });
      

            // Broadcast message to specific channel room
            socket.on('message', ({channelId, sender, message}) => {
                console.log(`Message from ${sender} in channel ${channelId}: ${message}`);
                channelChat.to(channelId).emit('message', {channelId, sender, message, timestamp: Date.now()});
            })

            // Event to count users in a channel room
            socket.on('reqNumUsers', (channelId) => {
                const room = channelChat.adapter.rooms.get(channelId);
                const size = room ? room.size : 0;
                socket.emit('numUsers', {channelId, size});
            })

            // Event to handle disconnection
            socket.on('disconnect', () => {
                console.log('User disconnected from channelChat namespace');
            });
       
        })
       
    }
}