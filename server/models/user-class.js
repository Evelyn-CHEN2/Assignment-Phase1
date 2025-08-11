class User {
    constructor(id, username, email, pwd, roles, groups, valid) {
        this.id = id;
        this.usename = username;
        this.email = email;
        this.pwd = pwd;
        this.roles = roles || [];
        this.groups = groups || [];
        this.valid = valid ;
    }
}

module.exports = User;