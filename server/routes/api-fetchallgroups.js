module.exports = {
    route: async(app, db) => {
        const groupsData = db.collection('groups');

        app.get('/api/allgroups', async(_req, res) => {
            try {
                const groups = await groupsData.find().toArray();
                res.send(groups);
            } 
            catch (error) {
                console.error('Error reading groups file: ', error);
                res.status(500).json({ error: 'Failed to retrieve groups.'})
            }
        })
    }
}