module.exports = {
    route: async(app, db) => {
        const usersData = db.collection('users');

        app.get('/api/fetchallusers', async(_req, res) => {
            try {
                const users = await usersData.find().toArray();
                res.send(users);
            } 
            catch (error) {
                console.error('Error reading users file: ', error);
                res.status(500).json({ error: 'Failed to retrieve users.' });
            }
        });
    }
}