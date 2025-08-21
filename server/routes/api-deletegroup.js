const fs = require('fs');
const path = require('path');

module.exports = {
    route: (app) => {
        const groupsFile = path.join(__dirname, '../data/groups.json');
        const channelsFile = path.join(__dirname, '../data/channels.json');

        // Function to read groups from file
        const readGroups = () => {
            const data = fs.readFileSync(groupsFile, 'utf8');
            const groups = JSON.parse(data);
            return Array.isArray(groups) ? groups : [];
        };

        // Function to write groups to file
        const writeGroups = (groups) => {
            fs.writeFileSync(groupsFile, JSON.stringify(groups, null, 2), 'utf8');
        }

        // Function to read channels from file
        const readChannels = () => {
            const data = fs.readFileSync(channelsFile, 'utf8');
            const channels = JSON.parse(data);
            return Array.isArray(channels) ? channels : [];
        }

        // Function to write channels to file
        const writeChannels = (channels) => {
            fs.writeFileSync(channelsFile, JSON.stringify(channels, null, 2), 'utf8');
        }

        app.delete('/api/deletegroup/:id', (req, res) => {
            if (!req.params.id) {
                return res.status(400).json({ error: 'No group ID provided' });
            }

            let groups = readGroups();
            
            // Check if the group exists
            const groupIndex = groups.findIndex(group => group.id === req.params.id);
            if (groupIndex === -1) {
                return res.status(404).json({ error: 'Group not found' });
            }

            // Remove the group from the array
            groups.splice(groupIndex, 1);

            // Remove channels associated with the group
            let channels = readChannels();
            channels = channels.filter(c => c.groupid != req.params.id);
            writeChannels(channels);

            try {
                writeGroups(groups);
                // Send a 204 No Content response, not ideal to do res.send(groups) since deleteGroup is not expecting a response
                return res.sendStatus(204)
            } catch (error) {
                console.error('Error writing groups file:', error);
                res.status(500).json({ error: 'Failed to delete group' });
            }
        })
    }
}