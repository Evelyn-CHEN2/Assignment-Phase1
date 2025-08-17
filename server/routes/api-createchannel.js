const fs = require('fs');
const path = require('path');

module.exports = {
    route: (app) => {
        const Channel = require('../models/channel-class');
        const channelsFile = path.join(__dirname, '../data/channels.json');
        const groupsFile = path.join(__dirname, '../data/groups.json');

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

        // Function to read groups from file
        const readGroups = () => {
            const data = fs.readFileSync(groupsFile, 'utf8');
            const groups = JSON.parse(data);
            return Array.isArray(groups) ? groups : [];
        }

        // Function to write groups to file
        const writeGroups = (groups) => {
            fs.writeFileSync(groupsFile, JSON.stringify(groups, null, 4), 'utf8');
        }

        app.post('/api/createchannel', (req, res) => {
            if (!req.body) {
                return res.status(400).json({ error: 'No data provided' });
            }

            // Check if the channels file exists, if not create it with an empty array
            let channels = readChannels();
            const existingChannel = channels.find(c => c.channelname === req.body.channelname);
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

            // Update the group with the new channel
            let groups = readGroups();
            const groupIndex = groups.findIndex(g => g.id === req.body.group.id);
            if (groupIndex === -1) {
                return res.status(404).json({ error: 'Group for added new channel not found' });
            }
            groups[groupIndex].channels.push(newChannel.id);
            writeGroups(groups);

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