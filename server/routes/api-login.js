module.exports = {
    route: async(app, db) => {
        const usersData = db.collection('users');

        app.post('/api/login', async(req, res) => {
        
            if (!req.body) {
                return res.status(400).json({ error: 'No data provided' });
            }
            const { username, pwd } = req.body;
            
            try {
                const loggedUser = await usersData.findOne({ username: username, pwd: pwd });
                if (!loggedUser) {
                    return res.status(401).json({ error: 'Invalid username or password' });
                }
                const safeUser = {
                    _id: loggedUser._id,  // loggedUser._id is an ObjectId
                    username: loggedUser.username,
                    email: loggedUser.email,
                    groups: loggedUser.groups,
                    valid: loggedUser.valid,
                    avatar: loggedUser.avatar
                };
                res.send(safeUser)
            }
            catch (error) {
                console.error('Error reading users file: ', error);
                res.status(500).json({ error: 'Failed to retrieve user.' });
            }

            

            
        
        
        
        })
    }
}

