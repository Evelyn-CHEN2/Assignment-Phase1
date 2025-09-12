const connectDB = require('../mongoDB');
const { ObjectId } = require('mongodb');

module.exports = {
    route: async(app) => {
        const db = await connectDB(); 
        const membershipData = db.collection('membership');

        app.get('/api/fetchmembership', async(req, res) => {
            // Fetch the user's membership details
            const userId = req.query.userId;

            try {
                const membership = await membershipData.findOne(
                    {admin: new ObjectId(userId)}
                );
                res.send(membership);
            } 
            catch (error) {
                console.error('Error reading user membership: ', error);
                res.status(500).json({ error: 'Failed to retrieve membership.' });
            }
        });
    }
}