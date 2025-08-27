const fs = require('fs');
const path = require('path');

module.exports = {
    route: (app) => {
        const applicationsFilePath = path.join(__dirname, '..', 'data', 'applications.json');
        const usersFilePath = path.join(__dirname, '..', 'data', 'users.json');

        // Function to read User 
    }
}