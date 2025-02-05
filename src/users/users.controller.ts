import { Controller, Get, Post,Body, Req, UseGuards, UnauthorizedException, Request, Query } from '@nestjs/common';
// import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UsersService } from './users.service';

@Controller()
@UseGuards(AuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('me')
    async getMe(@Request() request): Promise<User> {
        return request.user;
    }

    @Get('search')
    async searchUser(@Query() query: { username?: string, email?: string, age?: number, name?:string, surname?:string }): Promise<User[] | User | null> {
        return this.usersService.getUserByInfo({...query});
    }
}
