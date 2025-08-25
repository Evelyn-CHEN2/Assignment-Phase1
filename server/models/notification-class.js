class Notification {
    constructor(id, userId, groupsToApply, isApproved) {
        this.id = id;
        this.userId = userId;
        this.groupsToApply = groupsToApply;
        this.isApproved = isApproved;
    }
}

module.exports = Notification;