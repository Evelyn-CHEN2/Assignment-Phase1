const fs = require('fs');
const path = require('path');

exports.route = (app) => {
    const channelsFile = path.join(__dirname, '../data/channels.json');

    // Function to read channels from file
    const readChannels = () => {
        const data = fs.readFileSync(channelsFile, 'utf8');
        const channels = JSON.parse(data);
        return Array.isArray(channels) ? channels : [];
    }

    // Function to write channels to file
    const writeChannels = (channels) => {
        fs.writeFileSync(channelsFile, JSON.stringify(channels, null, 2), 'utf8');
    }

    app.post('/api/addmessage', (req, res) => {
        if (!req.body) {
            return res.status(400).json({ error: 'No data provided' });
        }

        // Find the channel to add message 
        let channels = readChannels();
        const channelIndex = channels.findIndex(c => c.id === req.body.channelId);
        if (channelIndex === -1) {
            return res.status(404).json({ error: 'Channel not found' });
        }
        const channel = channels[channelIndex];
        // Add the new message to the channel's messages
        channel.messages.push({
            sender: req.body.userId,
            text: req.body.text,
            timestamp: new Date().toISOString()
        })

        // Write the updated channels back to the file
        try {
            writeChannels(channels);
            res.send(channel);
        }
        catch (error) {
            console.error('Error adding message to channels file:', error);
            res.status(500).json({ error: 'Failed to add message' });
        }
        
    })
}