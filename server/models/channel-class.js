class Channel {
    constructor(channelname, id, groupid, chats) {
        this.id = id;
        this.channelname = channelname;
        this.groupid = groupid;
        this.chats = chats || [];
    }
}