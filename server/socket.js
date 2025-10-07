const { ObjectId } = require('mongodb');

module.exports = {
    connect: async(io, db) => {
        const channelChat = io.of('/channelChat');

        // Fetch collection
        const chatMsgs = db.collection('chatMsgs');
        await chatMsgs.createIndex({
            channelId: 1,
            timestamp: 1
        })

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
            socket.on('chatMsg', async({channelId, sender, message}) => {
                try {
                    const chatMsg = {
                        channelId: new ObjectId(String(channelId)),
                        sender: new ObjectId(String(sender)),
                        message: String(message),
                        timestamp: new Date()
                    }
                    const { insertedId } = await chatMsgs.insertOne(chatMsg)
                    channelChat.to(channelId).emit('chatMsg', {
                        _id: insertedId.toString(),
                        channelId, 
                        sender, 
                        message, 
                        timestamp: Date.now()
                    });
                } catch (err) {
                    console.error('chatMsg insert failed:', err);
                }
            })

            // Event to ensure the number of users get updated immediately
            socket.on('reqUserNum', (channelId) => {
                const room = channelChat.adapter.rooms.get(channelId);
                const size = room ? room.size : 0;
                socket.emit('userNum', {channelId, userNum: size});
            })

            // Event to handle disconnection
            socket.on('disconnect', () => {
                console.log('User disconnected from channelChat namespace');
            });

            // Tells the room the user's peerJS id
            socket.on('announcePeerId', ({ channelId, peerId, userId, sender }) => {
                socket.join(channelId);
                // Send id to others in the channel
                socket.to(channelId).emit('onPeerId', { channelId, peerId, userId, sender });
            });
            // Call ended 
            socket.on('endCall', ({ channelId }) => {
                socket.to(channelId).emit('callEnded', { channelId })
            })
       
        })
       
    }
}





