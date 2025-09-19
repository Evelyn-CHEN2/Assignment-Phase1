module.exports = {
    route: async(app, db) => {
        const banReportsData = await db.collection('banReports');

        app.get('/api/fetchallreports', async(_req, res) => {
            try {
                const allReports = await banReportsData.find().toArray();
                res.send(allReports);
            }
            catch (error) {
                console.error('Error reading ban reports file: ', error);
                res.status(500).json({ error: 'Failed to retrieve ban reports.'})
            }
        })
    }
}