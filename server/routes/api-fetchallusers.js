module.exports = {
    route: async(app, db) => {
        const userData = db.collection('users');

        app.get('/api/fetchallusers', async(_req, res) => {
            try {
                const users = await userData.find().toArray();
                res.send(users);
            } 
            catch (error) {
                console.error('Error reading users file: ', error);
                res.status(500).json({ error: 'Failed to retrieve users.' });
            }
        });
    }
}