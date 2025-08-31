const fs = require('fs');
const path = require('path');

module.exports = {
    route: (app) => {
        const User = require('../models/user-class');
        const usersFile = path.join(__dirname, '../data/users.json'); 

        // Function to read users from file
        const readUsers = () => {
            const data = fs.readFileSync(usersFile, 'utf8');
            const users = JSON.parse(data);
            return Array.isArray(users) ? users : [];
        };

        app.post('/api/login', (req, res) => {
            try {
                if (!req.body) {
                    return res.status(400).json({ error: 'No data provided' });
                }
                let users = readUsers();
                let loggedUser = null;
                for (const u of users) {  
                    if (u.username === req.body.username && u.pwd === req.body.pwd) {
                        loggedUser = u;
                        break;
                    }
                }
    
                if (!loggedUser) {
                    return res.status(401).json({ error: 'Invalid username or password' });
                }

                valid = loggedUser.valid;
    
                const safeUser = new User(
                    loggedUser.id,
                    loggedUser.username,
                    loggedUser.email,
                    '',
                    loggedUser.role,
                    loggedUser.groups ,
                    valid
                )
                res.send(safeUser)
            }
            catch (error) {
                console.error('Error reading login user file:', error);
                res.status(500).json({ error: 'Failed to login user' });
            }
            
        })
    }
}

