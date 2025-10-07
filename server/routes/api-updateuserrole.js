const { ObjectId } = require('mongodb');

module.exports = {
    route: async(app, db) => {
        const membershipData = db.collection('membership');
        const users = db.collection('users');

        app.put('/api/updateuser/:userId', async(req, res) => {
            const userId = String(req.params.userId);
            const groupId = String(req.body.groupId);
            const newRole = req.body.newRole;
            if (!userId || !groupId || !newRole) {
                return res.status(400).json({ error: 'Missing id or new role to update user role' });
            }
            
            // Write the updated user to file, update isSuper
            try {
                if (newRole === 'super') {
                    await users.updateOne(
                        { _id: new ObjectId(userId) },
                        { $set: {isSuper: true}}
                    )
                } else if (newRole === 'admin') {
                    await membershipData.updateOne(
                        { admin: new ObjectId(userId) },
                        { 
                            $addToSet: { groups: new ObjectId(groupId) },
                            $set: {role: newRole},
                            $setOnInsert: {
                                admin: new ObjectId(userId)
                            }
                        },
                        { upsert: true }
                    );
                }
                res.sendStatus(204)
            } 
            catch (error) {
                console.error('Error writing updated user file:', error);
                res.status(500).json({ error: 'Failed to update user' });
            }
        })

    }
}