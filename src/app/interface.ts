export interface User {
    _id: string;
    username: string;
    pwd: string;
    email: string;
    groups: string[];  // Store group ids
    valid: boolean;
    avatar: string;
}

export interface Group {
    _id: string;
    groupname: string;
    description: string;
    channels: string[]; // Store channel ids 
    createdBy: string // Store user.id
}

export interface Membership {
    _id: string;
    role: string;
    admin: string; // Store user id
    groups: string[]; // Store group ids
}

export interface Channel {
    _id: string;
    channelname: string;
    groupId: string;  // Store group.id
    chatMsg: chatMsg[];
}

export interface chatMsg {
    _id: string;
    message: string;
    sender: string; // Store user id
    channelId: string; // Store channel id
    timestamp: Date;
}

export interface Notification {
    _id: string;
    applier: string; // Store user.id who applies
    groupToApply: string; // Store group.id
    status: string; // 'pending', 'approved'
    approvedBy: string; // Store user.id(super/admin)
}

export interface UpdatedUserRole {
    user: User;
    group: Group;
}
