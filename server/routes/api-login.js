module.exports = {
    route: (app) => {
        const User = require('../models/user-class');

        app.post('/api/login', (req, res) => {

            let users = require('../data/users.json');
            if (!req.body) {
                return res.status(400).json({ error: 'No data provided' });
            }

            const { username, pwd } = req.body;
            const loggedUser = users.find(user => user.username === username && user.pwd === pwd);
            if (!loggedUser) {
                return res.status(401).json({ error: 'Invalid username or password' });
            } else {
                let user = new User(
                    loggedUser.id,
                    loggedUser.username,
                    loggedUser.email,
                    '',
                    loggedUser.roles,
                    loggedUser.groups,
                    loggedUser.isActive
                );
                res.send(user)
            }
        })
    }
}