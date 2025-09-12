const connectDB = require('../mongoDB')

module.exports = {
    route: async(app) => {
        const db = await connectDB();
        const groupData = db.collection('groups');

        app.get('/api/allgroups', async(req, res) => {
            try {
                const groups = await groupData.find().toArray();
                res.send(groups);
            } 
            catch (error) {
                console.error('Error reading groups file: ', error);
                res.status(500).json({ error: 'Failed to retrieve groups.'})
            }
        })
    }
}