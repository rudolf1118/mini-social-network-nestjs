import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import { FriendRequest } from './schemas/friend-request.schema';
import { Types } from 'mongoose';
import { UserNotFoundException, FriendRequestException } from '../common/exceptions/index';
import { ActionParams, DefaultResponse, FriendRequestResponse, FriendResponse } from '../common/types/common.types';
import { User } from '../users/schemas/user.schema';
import { UserSearchException } from '../common/exceptions/index';

@Injectable()
export class FriendsService {
    constructor(private usersService: UsersService, @InjectModel(FriendRequest.name) private friendRequestModel: Model<FriendRequest>) {}

    async getFriends(userId: string ): Promise<User[]> {
        const user = await this.usersService.getUserById(userId);
        if (!user) {
            throw new UserSearchException();
        }

        const friends = await this.usersService.getUsersByIds(user.friends.map(friend => friend.friendId));
        if (!friends || friends.length === 0) {
            throw new FriendRequestException('Friends not found');
        }
        return friends;
    }

    async addFriend (userId: string, friendId: string): Promise<FriendResponse> {
        const [user, friend] = await Promise.all([
            this.usersService.getUserById(userId),
            this.usersService.getUserById(friendId)
        ]);

        if (!friend || !user) {
            throw new UserNotFoundException(userId);
        }
        if (friend.friends.some(friend => friend.friendId === userId) 
            || user?.friends.some(friend => friend.friendId === friendId) 
            || friendId === userId) {
            throw new ConflictException('Friend already added');
        }

        friend.friends.push({ friendId: userId, addedAt: new Date() });
        user.friends.push({ friendId: friendId, addedAt: new Date() });

        await friend.save();
        await user.save();
        return {
            status: 'success',
            message: 'Friend added successfully',
            friend,
        };
    }

    async sendFriendRequest(userId: string, friendId: string): Promise<FriendRequestResponse> {
        const [sender, receiver] = await Promise.all([
            this.usersService.getUserById(userId),
            this.usersService.getUserById(friendId)
        ]);
        const existingFriendship = await this.friendRequestModel.findOne({
            $or: [
                { senderId: userId, receiverId: friendId },
                { senderId: friendId, receiverId: userId }
            ]
        });

        if (existingFriendship) {
            throw new ConflictException('Friend request already exists');
        }
        if (!sender || !receiver) {
            throw new UserNotFoundException(userId);
        }
        if (userId === friendId) {
            throw new FriendRequestException('You cannot send a friend request to yourself');
        }

        const existingRequest = await this.friendRequestModel.findOne({
            $or: [
                { senderId: userId, receiverId: friendId },
                { senderId: friendId, receiverId: userId }
            ]
        });

        if (existingRequest) {
            throw new ConflictException('Friend request already exists');
        }

        const friendRequest = await this.friendRequestModel.create({ senderId: sender.id, receiverId: receiver.id });

        return {
            status: 'success',
            message: 'Friend request sent successfully',
            friendRequest,
        };
    }

    async getFriendsRequests(userId: string): Promise<FriendRequestResponse> {
        const friendRequestsToMe = await this.friendRequestModel.find({
            receiverId: userId
        });
        const friendRequestsFromMe = await this.friendRequestModel.find({
            senderId: userId
        });
        const friendRequests: any[] = [];
        if (friendRequestsToMe.length > 0) {
            friendRequests.push({
                sendedToMe: friendRequestsToMe
            });
        }
        if (friendRequestsFromMe.length > 0) {
            friendRequests.push({
                sendedByMe: friendRequestsFromMe
            });
        }
        if (!friendRequests) {
            throw new FriendRequestException('Friend requests not found');
        }
        return {
            status: 'success',
            message: 'Friend requests found',
            friendRequest: friendRequests,
        };
    }

    async actionWithFriendRequest(params: ActionParams): Promise<DefaultResponse> {
        let friendRequest;

        if (params.friendId) {
            friendRequest = await this.friendRequestModel.findOne({ 
                $and: [
                    { senderId: params.friendId },
                    { receiverId: params.userId }
                ]
            });
        } else {
            friendRequest = await this.friendRequestModel.findOne({ 
                $and: [
                    { _id: params.requestId },
                    { receiverId: params.userId }
                ]
            });
        }

        if (!friendRequest) {
            throw new FriendRequestException('Friend request not found');
        }

        friendRequest.status = params.status;

        switch (params.status) {
            case 'accept':
                await this.addFriend(params.userId, friendRequest.senderId);
                await friendRequest.deleteOne();
                break;
            case 'decline':
                await friendRequest.deleteOne();
                break;
            case 'pending':
                await friendRequest.save();
                break;
        }

        return {
            status: 'success',
            message: params.status
                ? `Friend request ${params.status}ed successfully`
                : 'Friend request is pending'
        };
    }

    async handleFriendRequest(params: ActionParams): Promise<DefaultResponse> {
        const user = await this.usersService.getUserById(params.userId);
        
        if (!user) {
            throw new UserNotFoundException('User not found');
        }
        return this.actionWithFriendRequest(params);
    }
}