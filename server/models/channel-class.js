class Channel {
    constructor(id, channelname, groupid, chats) {
        this.id = id;
        this.channelname = channelname;
        this.groupid = groupid;
        this.chats = chats || [];
    }
}

module.exports = Channel;