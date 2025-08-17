class Group {
    constructor(id, groupname, description, channels, createdBy) {
        this.id = id;
        this.groupname = groupname;
        this.description = description || '';
        this.channels = channels || [];
        this.createdBy = createdBy; // Store user id, user name might change
    }
}

module.exports = Group;
