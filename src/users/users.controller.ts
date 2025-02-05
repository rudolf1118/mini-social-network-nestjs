import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { User } from './schemas/user.schema';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UsersService } from './users.service';
import { UserSearchException } from '../common/exceptions/index';
import { SearchQuery } from '../common/types/common.types';

@Controller()
@UseGuards(AuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('me')
    async getMe(@Request() request): Promise<User> {
        return request.user;
    }

    @Get('search')
    async searchUser(@Query() query: SearchQuery): Promise<User[] | User> {
        const users = await this.usersService.getUserByInfo({...query});
        if (!users) {
            throw new UserSearchException();
        }
        return users;
    }
}
