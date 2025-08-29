class Notification {
    constructor(id, applier, groupToApply, status, approvedBy) {
        this.id = id;
        this.applier = applier; // Store user ID
        this.groupToApply = groupToApply; // Store group ID
        this.status = status; // pending, approved
        this.approvedBy = approvedBy; // Store user ID(super/admin)
    }
}

module.exports = Notification;