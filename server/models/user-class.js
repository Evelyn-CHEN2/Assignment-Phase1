class User {
    constructor(id, username, email, roles, groups, isActive) {
        this.id = id;
        this.usename = username;
        this.email = email;
        this.roles = roles || [];
        this.groups = groups || [];
        this.isActive = isActive || true;
    }
}

module.exports = User;