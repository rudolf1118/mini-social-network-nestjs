import { User } from '../../users/schemas/user.schema';
import { FriendRequest } from '../../friends/schemas/friend-request.schema';

export type SearchQuery = {
    username?: string,
    email?: string,
    age?: number,
    name?:string,
    surname?:string
};

export interface FriendRequestResponse extends DefaultResponse {
    friendRequest:FriendRequest | FriendRequest[]
};

export interface FriendResponse extends DefaultResponse {
    friend: User | User[]
}

export type ActionParams = {
    userId: string;
    requestId: string;
    status: 'accept' | 'decline' | 'pending';
    friendId?: string;
}


export interface DefaultResponse {
    status: string,
    message: string
}