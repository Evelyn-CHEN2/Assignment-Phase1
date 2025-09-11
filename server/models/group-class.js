class Group {
    constructor(_id, groupname, description, channels, createdBy) {
        this._id = _id;
        this.groupname = groupname;
        this.description = description || '';
        this.channels = channels || [];
        this.createdBy = createdBy; // Store user id
    }
}

module.exports = Group;
