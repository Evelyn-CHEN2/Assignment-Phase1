class Group {
    constructor(id, groupname, description, channels, createdBy, admins) {
        this.id = id;
        this.groupname = groupname;
        this.description = description || '';
        this.channels = channels || [];
        this.createdBy = createdBy; // Store user id, user name might change
        this.admins = admins || []; // Store user ids of admins
    }
}

module.exports = Group;
