const connectDB = require('../mongoDB');

module.exports = {
    route: async(app) => {
        const db = await connectDB();
        const channelData = db.collection('channels');

        app.get('/api/allchannels', async(req, res) => {
            try {
                const channels = await channelData.find().toArray();
                res.send(channels);
            } 
            catch (error) {
                console.error('Error reading channels file: ', error);
                res.status(500).json({ error: 'Failed to retrieve channels.' });
            }
        });
    }
}


