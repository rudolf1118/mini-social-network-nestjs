import { Controller, Get, UseGuards, Request, Post, Query, ConflictException } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UsersService } from '../users/users.service';
import { FriendRequestException, UserNotFoundException } from '../common/exceptions/index';
import { User } from '../users/schemas/user.schema';
import { DefaultResponse, FriendRequestResponse } from '../common/types/common.types';

@Controller('friends')
@UseGuards(AuthGuard)
export class FriendsController {
    constructor(private friendsService: FriendsService, private usersService: UsersService) {}

    @Get()
    async getFriends(@Request() request): Promise<User[]> {
        const user = await this.usersService.getUserById(request.user.id);
        if (!user) {
            throw new UserNotFoundException(request.user.id);
        }
        const friends = await this.friendsService.getFriends(user?.id);
        if (!friends) {
            throw new FriendRequestException('Friends not found');
        }
        return friends;
    }

    @Get('requests')
    async getRequests(@Request() request): Promise<FriendRequestResponse> {
        const user = await this.usersService.getUserById(request.user.id);
        if (!user) {
            throw new UserNotFoundException(request.user.id);
        }
        const requests = await this.friendsService.getFriendsRequests(user?.id);
        if (!requests) {
            throw new FriendRequestException('Friend requests not found');
        }
        return requests;
    }

    @Post('sendRequest')
    async sendRequest(@Query('friendId') friendId: string, @Request() request): Promise<FriendRequestResponse> {
        const user = await this.usersService.getUserById(request.user.id);
        if (!user) {
            throw new UserNotFoundException(request.user.id);
        }
        if (user.friends.map(friend => friend.friendId).includes(friendId)) {
            throw new ConflictException('Friend already added');
        }
        return this.friendsService.sendFriendRequest(user.id, friendId);
    }

    @Get('actionRequest')
    async actionRequest(@Query('requestId') requestId: string, @Query('friendId') friendId: string, @Query('status') status: 'accept' | 'decline' | 'pending', @Request() request): Promise<DefaultResponse> {
        const user = await this.usersService.getUserById(request.user.id);
        if (!user) {
            throw new UserNotFoundException(request.user.id);
        }
        return this.friendsService.handleFriendRequest({ userId: user?.id, requestId, status, friendId });
    }
}