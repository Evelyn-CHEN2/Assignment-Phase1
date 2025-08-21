class User {
    constructor(id, username, email, pwd, role, groups, valid) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.pwd = pwd;
        this.role = role;
        this.groups = groups || [];
        this.valid = valid ;
    }
}

module.exports = User;