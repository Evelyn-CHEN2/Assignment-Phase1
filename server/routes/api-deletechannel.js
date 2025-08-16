const fs = require('fs');
const path = require('path');

module.exports = {
    route: (app) => {
        const channelsFile = path.join(__dirname, '../data/channels.json');

        // Function to read channels from file
        const readChannels = () => {
            const data = fs.readFileSync(channelsFile, 'utf8');
            const channels = JSON.parse(data);
            return Array.isArray(channels) ? channels : [];
        }
        // Write channels to file
        const writeChannels = (channels) => {
            fs.writeFileSync(channelsFile, JSON.stringify(channels, null, 2), 'utf8');
        }

        app.delete('/api/deletechannel/:id', (req,res) => {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ error: 'No channel ID provided to delete' });
            }

            let channels = readChannels();
            channels = channels.filter(channel => channel.id !== id);

            try {
                writeChannels(channels);
                res.send(channels); // Return the updated list of channels
            }
            catch (error) {
                console.error('Error deleting channel:', error);
                res.status(500).json({ error: 'Failed to delete channel' });
            }
        })
    }
}