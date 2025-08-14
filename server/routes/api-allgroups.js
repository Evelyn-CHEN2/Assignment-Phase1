const fs = require('fs')
const path = require('path')

module.exports = {
    route: (app) => {
        const groupsFile = path.join(__dirname, '../data/groups.json');
        //Function to read groups from file
        const readGroups = () => {
            const data = fs.readFileSync(groupsFile, 'utf8');
            const groups = JSON.parse(data);
            return Array.isArray(groups) ? groups : [];
        }

        app.get('/api/allgroups', (req, res) => {
            try {
                const groups = readGroups();
                res.send(groups)
            } 
            catch (error) {
                console.error('Error reading groups file: ', error);
                res.status(500).json({ error: 'Failed to retrieve groups.'})
            }
        })
    }
}