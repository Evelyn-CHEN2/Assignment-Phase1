class Notification {
    constructor(id, applier, groupToApply, groupCreator, status) {
        this.id = id;
        this.applier = applier;
        this.groupToApply = groupToApply; // Store group ID
        this.groupCreator = groupCreator; // Strore group.createdBy, it is user ID
        this.status = status; // pending, approved
    }
}

module.exports = Notification;