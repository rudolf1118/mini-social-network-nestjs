import { Controller, Get, Param, UseGuards, Request, Post, Query } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UsersService } from '../users/users.service';

@Controller('friends')
@UseGuards(AuthGuard)
export class FriendsController {
    constructor(private friendsService: FriendsService, private usersService: UsersService) {}

    @Get()
    async getFriends(@Request() request): Promise<any[]> {
        const user = await this.usersService.getUserById(request.user.id);
        const friends = await this.friendsService.getFriends(user?.id);
        return this.usersService.getUsersByIds(friends);
    }

    @Get('requests')
    async getRequests(@Request() request): Promise<any> {
        const user = await this.usersService.getUserById(request.user.id);
        return this.friendsService.getFriendsRequests(user?.id);
    }

    @Post('sendRequest')
    async sendRequest(@Query('friendId') friendId: string, @Request() request): Promise<any> {
        const user = await this.usersService.getUserById(request.user.id);
        return this.friendsService.sendFriendRequest(user?.id, friendId);
    }

    @Get('actionRequest')
    async actionRequest(@Query('requestId') requestId: string, @Query('friendId') friendId: string, @Query('status') status: 'accept' | 'decline' | 'pending', @Request() request): Promise<any> {
        return this.friendsService.handleFriendRequest(requestId, request.user.id, status, friendId);
    }
}