class User {
    constructor(id, username, email, pwd, roles, groups, valid) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.pwd = pwd;
        this.roles = roles || [];
        this.groups = groups || [];
        this.valid = valid ;
    }
}

module.exports = User;