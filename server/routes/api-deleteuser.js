const { ObjectId } = require('mongodb');

module.exports = {
    route: async(app, db) => {
        const userData = db.collection('users');
        const membershipData = db.collection('membership');

        app.delete('/api/deleteuser/:userId', async(req, res) => {
            const userId = String(req.params.userId);
            if (!userId) {
                return res.status(400).json({ error: 'No user ID or group ID provided to delete' });
            }
            
            // Remove the user with the specified ID
            // And remove the membership if the user is admin or super
            try {
                await userData.deleteOne({ _id: new ObjectId(userId) });
                await membershipData.deleteOne({ admin: new ObjectId(userId) });
                res.sendStatus(204); // No response expected
            } 
            catch (error) {
                console.error('Error deleting user:', error);
                res.status(500).json({ error: 'Failed to delete user' });
            }
        });
    }
}