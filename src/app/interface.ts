export interface User {
    id: number;
    username: string;
    pwd: string;
    email: string;
    groups: string[];  //Store group data to get direct access
    role: string;
    status: boolean;
    valid: boolean;
}

export interface Group {
    id: string;
    groupname: string;
    description: string;
    channels: Channel[]; //Store channel data to get direct access
    createdBy: number | undefined;  //Store user.id
}

export interface Channel {
    id: string;
    channelname: string;
    messages: { sender: number; text: string; timestamp: Date }[]; // Sender is user.id
    groupid: string;  //Store group.id
}

export interface Notification {
    id: string;
    userId: number; //Store user.id
    groupsToApply: string[]; //Store group.id
    isApproved: boolean;
}