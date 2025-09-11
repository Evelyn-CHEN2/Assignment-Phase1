class Channel {
    constructor(_id, channelname, groupId, chatMsg) {
        this._id = _id;
        this.channelname = channelname;
        this.groupId = groupId;
        this.chatMsg = chatMsg || [];
    }
}

module.exports = Channel;