const fs = require('fs');
const path = require('path');

module.exports = {
    route: (app) => {
        const channelsFile = path.join(__dirname, '../data/channels.json');
        const groupsFile = path.join(__dirname, '../data/groups.json');

        // Function to read channels from file
        const readChannels = () => {
            const data = fs.readFileSync(channelsFile, 'utf8');
            const channels = JSON.parse(data);
            return Array.isArray(channels) ? channels : [];
        }
        // Write channels to file
        const writeChannels = (channels) => {
            fs.writeFileSync(channelsFile, JSON.stringify(channels, null, 2), 'utf8');
        }

        // Function to read groups from file
        const readGroups = () => {
            const data = fs.readFileSync(groupsFile, 'utf8');
            const groups = JSON.parse(data);
            return Array.isArray(groups) ? groups : [];
        }
        // Write groups to file
        const writeGroups = (groups) => {
            fs.writeFileSync(groupsFile, JSON.stringify(groups, null, 2), 'utf8');
        }

        app.delete('/api/deletechannel/:id', (req,res) => {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ error: 'No channel ID provided to delete' });
            }

            let channels = readChannels();
            // Delete the channel with the given ID
            channels = channels.filter(channel => channel.id !== id);

            // Delete corresponding group.channels
            let groups = readGroups();
            groups = groups.map(g => {
                g.channels = g.channels.filter(cId => cId !== id);
                return g;
            })

            try {
                writeChannels(channels);
                writeGroups(groups);
                res.sendStatus(204); // No response expected
            }
            catch (error) {
                console.error('Error deleting channel:', error);
                res.status(500).json({ error: 'Failed to delete channel' });
            }
        })
    }
}