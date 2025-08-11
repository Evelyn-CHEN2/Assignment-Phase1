class User {
    constructor(id, username, email, pwd, roles, groups, isActive) {
        this.id = id;
        this.usename = username;
        this.email = email;
        this.pwd = pwd;
        this.roles = roles || [];
        this.groups = groups || [];
        this.isActive = isActive || true;
    }
}

module.exports = User;