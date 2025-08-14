export interface User {
    id: number;
    username: string;
    pwd: string;
    email: string;
    groups: Group[];  //Store group data to get direct access
    role: string;
    status: boolean;
    valid: boolean;
    _pendingAction?: string; //Used to store pending action for user
}

export interface Group {
    id: string;
    groupname: string;
    description: string;
    channels: Channel[]; //Store channel data to get direct access
    createdBy: number;  //Store user.id
}

export interface Channel {
    id: string;
    channelname: string;
    description: string;
    groupid: string;  //Store group.id
}
