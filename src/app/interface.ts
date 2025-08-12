export interface User {
    id: number;
    username: string;
    pwd: string;
    email: string;
    groups: Group[];  //Store group data to get direct access
    roles: string[];
    valid: boolean;
}

export interface Group {
    id: number;
    name: string;
    description: string;
    channels: Channel[]; //Store channel data to get direct access
    createdBy: number;  //Store user.id
}

export interface Channel {
    id: number;
    name: string;
    description: string;
    groupId: number;  //Store group.id
}
