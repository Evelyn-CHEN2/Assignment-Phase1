const fs = require('fs');
const path = require('path');

module.exports = {
    route: (app) => {
        const User = require('../models/user-class');
        const usersFile = path.join(__dirname, '../data/users.json'); 

        // Function to read users from file
        const readUsers = () => {
            const data = fs.readFileSync(usersFile, 'utf8');
            return JSON.parse(data);
        };

        // Function to write users to file
        const writeUsers = (users) => {
            fs.writeFileSync(usersFile, JSON.stringify(users, null, 4), 'utf8');
        };

        app.post('/api/register', (req, res) => {
            if (!req.body || !req.body.username || !req.body.pwd || !req.body.email) {
                return res.status(400).json({ error: 'Invalid data provided' });
            }

            // Check if the users file exists, if not create it with an empty array
            let users = readUsers();
            
            const existingUser = users.find(user => user.username === req.body.username);
            if (existingUser) {
                return res.status(400).json({ error: 'Username already exists' });
            }

            const newUser = new User(
                users.length + 1,
                req.body.username,
                req.body.email,
                req.body.pwd,
                ["chatuser"],
                [],
                true
            );

            users.push(newUser);

            try {
                writeUsers(users);
                res.status(201).json(newUser);
            } catch (error) {
                console.error('Error writing users file:', error);
                res.status(500).json({ error: 'Failed to save user' });
            }
        });
    }
}




// module.exports = {
//     route: (app) => {
//         const User = require('../models/user-class');
//         const users = [
//             new User(1, "super", "super@com", "123", ["super"], [], false),
//             new User(2, "Tom", "Tom@com", "1234", ["chatuser"], [], false)
//         ];

//         app.post('/api/register', (req, res) => {
//             if (!req.body || !req.body.username || !req.body.pwd || !req.body.email) {
//                 return res.status(400).json({ error: 'Invalid data provided' });
//             }

//             const existingUser = users.find(user => user.username === req.body.username);
//             if (existingUser) {
//                 return res.status(400).json({ error: 'Username already exists' });
//             }

//             const newUser = new User(
//                 users.length + 1,
//                 req.body.username,
//                 req.body.email,
//                 req.body.pwd,
//                 ["chatuser"],
//                 [],
//                 true
//             );

//             users.push(newUser);
//             res.status(201).json(newUser);
//         });
//     }
// }

