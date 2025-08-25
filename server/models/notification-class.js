class Notification {
    constructor(id, applier, groupToApply, groupCreator, isApproved, applyAppending) {
        this.id = id;
        this.applier = applier;
        this.groupToApply = groupToApply; // Store group ID
        this.groupCreator = groupCreator; // Strore group.createdBy, it is user ID
        this.isApproved = isApproved;
        this.applyAppending = applyAppending;
    }
}

module.exports = Notification;