const { ObjectId } = require('mongodb');

module.exports = {
    route: async(app, db) => {
        const userData = db.collection('users');

        app.get('/api/fetchuserbyID/:id', async(req, res) => {
            const userId = String(req.params.id);
            if (!userId) {
                return res.status(400).json({ error: 'No user ID provided' });
            }

            try {
                const user = await userData.findOne({ _id: new ObjectId(userId) });
                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }
                res.send(user);
            } catch (error) {
                console.error('Error reading users file: ', error);
                res.status(500).json({ error: 'Failed to retrieve user.' });
            }
        });
    }
}