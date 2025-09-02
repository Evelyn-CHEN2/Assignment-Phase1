class BanReport {
    constructor(id, bannedUser, bannedBy) {
        this.id = id;
        this.bannedUser= bannedUser;
        this.bannedBy = bannedBy;
    }
}

module.exports = BanReport;