import { Controller, Get, Post,Body, Req, UseGuards, UnauthorizedException, Request } from '@nestjs/common';
// import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @UseGuards(AuthGuard)
    @Get('me')
    getMe(@Request() request): Promise<User> {
        return request.user;
    }
}