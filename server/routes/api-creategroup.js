const fs = require('fs');
const path = require('path');

module.exports = {
    route: (app) => {
        const groupsFile = path.join(__dirname, '../data/groups.json');
        const channelsFile = path.join(__dirname, '../data/channels.json');
        const Group = require('../models/group-class');
        const Channel = require('../models/channel-class');

        // Function to read groups from file
        const readGroups = () => {
            const data = fs.readFileSync(groupsFile, 'utf8');
            const groups = JSON.parse(data);
            return Array.isArray(groups) ? groups : [];
        };

        //Function to read channels from file
        const readChannels = () => {
            const data = fs.readFileSync(channelsFile, 'utf8');
            const channels = JSON.parse(data);
            return Array.isArray(channels) ? channels : [];
        }

        // Function to write channels to file
        const writeChannels = (channels) => {
            fs.writeFileSync(channelsFile, JSON.stringify(channels, null, 2), 'utf8');
        }

        // Write groups to file
        const writeGroups = (groups) => {
            fs.writeFileSync(groupsFile, JSON.stringify(groups, null, 2), 'utf8');
        };

        // Function to read users from file
        const readUsers = () => {
            const usersFile = path.join(__dirname, '../data/users.json');
            const data = fs.readFileSync(usersFile, 'utf8');
            const users = JSON.parse(data);
            return Array.isArray(users) ? users : [];
        };

        // Write users to file
        const writeUsers = (users) => {
            const usersFile = path.join(__dirname, '../data/users.json');
            fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8');
        }

        app.post('/api/creategroup', (req, res) => {
          
                if (!req.body || !req.body.groupname || !req.body.description || !req.body.channelNames || !req.body.currentUser) {
                    return res.status(400).json({ error: 'Invalid request data' });
                }
                let groups = readGroups();
                const groupname = req.body.groupname;
                const description = req.body.description;
                
                // Check if group already exists
                const existingGroup = groups.find(g => g.groupname === groupname.trim());
                if (existingGroup) {
                    return res.status(400).json({ error: 'Group already exists' });
                }

                const newGroupid = 'g' + Date.now().toString()

                // Create new channel objects
                const channelnames = req.body.channelNames;
                const newchannels = channelnames.map((channelname,idx) => {
                    return new Channel(
                        'c' + (Date.now() + idx),
                        channelname,
                        newGroupid,
                        [],
                    )
                })
                let channels = readChannels();
                channels = channels.concat(newchannels);
                writeChannels(channels);

                // Create new group object
                const newgroup = new Group(
                    newGroupid,
                    groupname.trim(),
                    description.trim(),
                    newchannels.map(channel => channel.id),
                    req.body.currentUser.id,
                )
                groups.push(newgroup);

                // Add new group to the user who created it
                let users = readUsers();
                const creator = users.find(u => u.id === req.body.currentUser.id);
                creator.groups.push(newGroupid);

                try {
                    writeGroups(groups);
                    writeUsers(users);
                    res.send(newgroup);
                }
                catch (error) {
                    console.error('Error creating new group:', error);
                    res.status(500).json({ error: 'Failed to create group' });
                }
                
            
           
        })
    }
}