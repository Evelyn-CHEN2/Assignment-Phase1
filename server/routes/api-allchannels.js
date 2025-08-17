const fs = require('fs')
const path = require('path')

module.exports = {
    route: (app) => {
        const channelsFile = path.join(__dirname, '../data/channels.json');
        // Function to read channels from file
        const readChannels = () => {
            const data = fs.readFileSync(channelsFile, 'utf8');
            const channels = JSON.parse(data);
            return Array.isArray(channels) ? channels : [];
        }
        app.get('/api/allchannels', (req, res) => {
            try {
                const channels = readChannels();
                res.send(channels);
            } 
            catch (error) {
                console.error('Error reading channels file: ', error);
                res.status(500).json({ error: 'Failed to retrieve channels.' });
            }
        });
    }
}


