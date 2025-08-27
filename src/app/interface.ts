export interface User {
    id: number;
    username: string;
    pwd: string;
    email: string;
    groups: string[];  // Store group data to get direct access
    role: string;
    status: boolean;
    valid: boolean;
}

export interface Group {
    id: string;
    groupname: string;
    description: string;
    channels: Channel[]; // Store channel data to get direct access
    createdBy: number | undefined;  // Store user.id
    admins: number[]; // Store user.id
}

export interface Channel {
    id: string;
    channelname: string;
    messages: { sender: number; text: string; timestamp: Date }[]; // Sender is user.id
    groupid: string;  // Store group.id
}

export interface Notification {
    id: string;
    applier: number; // Store user.id who applies
    groupToApply: string; // Store group.id
    groupCreator: number; // Store user.id who create the group
    status: string; // 'pending', 'approved'
    applyAppending: boolean;
}

export interface UpdatedUserRole {
    user: User;
    group: Group;
}