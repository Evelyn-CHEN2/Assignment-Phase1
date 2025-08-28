class Notification {
    constructor(id, applier, groupToApply, status) {
        this.id = id;
        this.applier = applier; // Store user ID
        this.groupToApply = groupToApply; // Store group ID
        this.status = status; // pending, approved
    }
}

module.exports = Notification;