class Channel {
    constructor(id, channelname, groupid, messages) {
        this.id = id;
        this.channelname = channelname;
        this.groupid = groupid;
        this.messages = messages || [];
    }
}

module.exports = Channel;