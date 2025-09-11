const connectDB = require('../mongoDB');

module.exports = {
    route: async(app) => {
        const db = await connectDB();
        // Function to read users from file
        const data = db.collection('users');

        app.get('/api/fetchallusers', async(req, res) => {
            try {
                const users = await data.find().toArray();
                res.send(users);
            } 
            catch (error) {
                console.error('Error reading users file: ', error);
                res.status(500).json({ error: 'Failed to retrieve users.' });
            }
        });
    }
}