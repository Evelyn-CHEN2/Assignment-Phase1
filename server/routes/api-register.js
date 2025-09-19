module.exports = {
    route: async(app, db) => {
        const usersData = db.collection('users');

        app.post('/api/register', async(req, res) => {
            if (!req.body || !req.body.username || !req.body.pwd || !req.body.email) {
                return res.status(400).json({ error: 'Invalid data provided' });
            }
            const { username, email, pwd } = req.body;

            // Check if the users file exists, if not create it with an empty array
            let users = await usersData.find().toArray();
            const existingUserName = users.find(user => user.username.toLowerCase() === username.toLowerCase().trim());
            if (existingUserName) {
                return res.status(400).json({ error: 'User name already exists' });
            }

            // Create new user document
            try {
                const newData= {
                    username: username.trim(),
                    email: email.trim(),
                    pwd: pwd,
                    groups: [],
                    valid: true,
                    avatar: null,
                    isSuper: false
                };
                const { insertedId } = await usersData.insertOne(newData);
                // Send formatted user data back to fontend for UI update, remove pwd
                const safeUser = { ...newData, _id: insertedId };
                delete safeUser.pwd;
                res.send(safeUser);
            } 
            catch (error) {
                console.error('Error writing user data:', error);
                res.status(500).json({ error: 'Failed to register user' });
            }
        });
    }
}



