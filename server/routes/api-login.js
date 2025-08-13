module.exports = {
    route: (app) => {
        const User = require('../models/user-class');
        const users = {   
            "id": 1, "username": "super", "email": "super@com", "pwd":"123", "roles": ["super"],"groups": [], "valid":false,
            "id": 2, "username": "Tom", "email": "Tom@com", "pwd": "1234", "roles": ["chatuser"],"groups": [], "valid":false  
        }
        app.post('/api/login', (req, res) => {
            if (!req.body) {
                return res.status(400).json({ error: 'No data provided' });
            }

            let user = new User('', req.body.username, '', '', [], [], false)

            const loggedUser = users.find(user => user.username === req.body.username && user.pwd === req.body.pwd);
            if (loggedUser) {
                user.id = loggedUser.id;
                user.username = loggedUser.username;
                user.email = loggedUser.email;
                user.roles = loggedUser.roles;
                user.groups = loggedUser.groups;
                user.valid = true;
            }
            res.send(user)
        })
    }
}

