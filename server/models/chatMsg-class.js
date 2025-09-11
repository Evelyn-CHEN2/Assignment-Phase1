class ChatMsg {
    constructor(_id, message, sender, channelId) {
        this._id = _id;
        this.message = message;
        this.sender = sender;
        this.channelId = channelId;
    }
}

module.exports = ChatMsg;