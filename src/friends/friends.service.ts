import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import { FriendRequest } from './schemas/friend-request.schema';
import { Types } from 'mongoose';

@Injectable()
export class FriendsService {
    constructor(private usersService: UsersService, @InjectModel(FriendRequest.name) private friendRequestModel: Model<FriendRequest>) {}

    async getFriends(userId: string ): Promise<any[]> {
        const user = await this.usersService.getUserById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user.friends.map(friend => friend.friendId);
    }


    async addFriend (userId: string, friendId: string): Promise<any> {
        const user = await this.usersService.getUserById(userId);
        const friend = await this.usersService.getUserById(friendId);

        if (!friend || !user) {
            throw new NotFoundException('User not found');
        }
        if (friend.friends.some(friend => friend.friendId === userId) || user?.friends.some(friend => friend.friendId === friendId) || friendId === userId) {
            throw new ConflictException('Friend already added');
        }

        friend.friends.push({ friendId, addedAt: new Date() });
        user.friends.push({ friendId, addedAt: new Date() });
        await friend.save();
        await user.save();
        return {
            status: 'success',
            message: 'Friend added successfully'
        };
    }

    async sendFriendRequest(userId: string, friendId: string): Promise<any> {
        const senderId = await this.usersService.getUserById(userId);
        const receiverId = await this.usersService.getUserById(friendId);

        if (!senderId || !receiverId) {
            throw new NotFoundException('User not found');
        }

        if (await this.friendRequestModel.findOne({ 
            $or: [
                { senderId: userId, receiverId: friendId },
                { senderId: friendId, receiverId: userId }
            ]
        })) {
            throw new ConflictException('Friend request already sent');
        }
        if (userId === friendId) {
            throw new ConflictException('You cannot send a friend request to yourself');
        }
        const friendRequest = new this.friendRequestModel({ senderId: userId, receiverId: friendId });
        await friendRequest.save();

        return {
            status: 'success',
            message: 'Friend request sent successfully'
        };
    }

    async getFriendsRequests(userId: string): Promise<any> {
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
            throw new NotFoundException('Friend requests not found');
        }
        return friendRequests;
    }

    async actionWithFriendRequest(userId: string, requestId: string, status: 'accept' | 'decline' | 'pending', friendId: string = ""): Promise<any> {
        let friendRequest;
        if (friendId) {
            friendRequest = await this.friendRequestModel.findOne({ 
                $and: [
                    { senderId: friendId },
                    { receiverId: userId }
                ]
            });
        } else {
            friendRequest = await this.friendRequestModel.findOne({ 
                $and: [
                    { _id: new Types.ObjectId(requestId) },
                    { receiverId: userId }
                ]
            });
        }

        if (!friendRequest) {
            throw new NotFoundException('Friend request not found');
        }

        friendRequest.status = status;

        switch (status) {
            case 'accept':
                await this.addFriend(userId, friendRequest.senderId);
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
            message: status === 'pending' 
                ? 'Friend request is pending'
                : `Friend request ${status}ed successfully`
        };
    }

    async handleFriendRequest(requestId: string, userId: string, status: 'accept' | 'decline' | 'pending' = 'pending', friendId: string = ""): Promise<any> {
        const user = await this.usersService.getUserById(userId);
        return this.actionWithFriendRequest(user?.id, requestId, status, friendId);
    }
}