const fs = require('fs');
const path = require('path');

module.exports = {
    route: (app) => {
        const Channel = require('../models/channel-class');
        const channelsFile = path.join(__dirname, '../data/channels.json');

        // Function to read channels from file
        const readChannels = () => {
            const data = fs.readFileSync(channelsFile, 'utf8');
            const channels = JSON.parse(data);
            return Array.isArray(channels) ? channels : [];
        }

        // Function to write channels to file
        const writeChannels = (channels) => {
            fs.writeFileSync(channelsFile, JSON.stringify(channels, null, 4), 'utf8');
        }

        app.post('/api/createchannel', (req, res) => {
            if (!req.body) {
                return res.status(400).json({ error: 'No data provided' });
            }

            // Check if the channels file exists, if not create it with an empty array
            let channels = readChannels();
            const existingChannel = channels.find(channel => channel.channelname === req.body.channelname);
            if (existingChannel) {
                return res.status(400).json({ error: 'Channel name already exists' });
            }

            const newChannel = new Channel(
                "c" + String(channels.length + 1),
                req.body.channelName,
                req.body.group.id,
                []
            )

            channels.push(newChannel);

            try {
                writeChannels(channels);
                res.send(newChannel);
            } 
            catch (error) {
                console.error('Error writing single channel file:', error);
                res.status(500).json({ error: 'Failed to write single channel' });
            }
        })
    }
}