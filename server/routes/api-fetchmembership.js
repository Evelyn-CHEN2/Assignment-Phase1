const connectDB = require('../mongoDB');

module.exports = {
    route: async(app) => {
        const db = await connectDB();
        const membershipData = db.collection('membership');

        app.get('/api/fetchmembership', async(req, res) => {
            try {
                const membership = await membershipData.find().toArray();
                res.send(membership);
            } 
            catch (error) {
                console.error('Error reading users file: ', error);
                res.status(500).json({ error: 'Failed to retrieve users.' });
            }
        });
    }
}