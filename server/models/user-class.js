class User {
    constructor(_id, username, email, pwd, groups, valid, avatar) {
        this._id = _id;
        this.username = username;
        this.email = email;
        this.pwd = pwd;
        this.groups = groups || [];
        this.valid = valid ;
        this.avatar = avatar;
    }
}

module.exports = User;