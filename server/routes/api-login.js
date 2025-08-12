module.exports = {
    route: (app) => {
        const User = require('../models/user-class');

        app.post('/api/login', (req, res) => {

            let users = require('../data.json');
            if (!req.body) {
                return res.status(400).json({ error: 'No data provided' });
            }

            let user = new User('', req.body.username, '', '', [], [], false)
            // const { username, pwd } = req.body;
            const loggedUser = users.find(user => user.username === req.body.username && user.pwd === req.body.pwd);
            if (loggedUser) {
                user.valid = true;
                user.id = loggedUser.id;
                user.username = loggedUser.username;
                user.email = loggedUser.email;
                user.roles = loggedUser.roles;
                user.groups = loggedUser.groups;
            }
            res.send(user)
        })
    }
}