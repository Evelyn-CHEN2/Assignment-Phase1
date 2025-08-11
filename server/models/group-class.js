class Group {
    constractor(id, groupname, description, channels, createdBy) {
        this.id = id;
        this.groupnamename = groupname;
        this.description = description || '';
        this.channels = channels || [];
        this.createdBy = null; // This will be set later when the group is created
    }
}

module.exports = Group;

