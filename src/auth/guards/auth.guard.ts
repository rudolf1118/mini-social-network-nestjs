import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService, private readonly usersService: UsersService) {}

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const { authorization } = request.headers;

        if (!authorization) {
            throw new UnauthorizedException();
        }
        const token = authorization.split(' ')[1];

        if (!token) {
            throw new UnauthorizedException();
        }
        try {
            const decoded = await this.jwtService.verifyAsync(token);
            
            const user = await this.usersService.getUserById(decoded.sub);
            console.log(user?.password)
            if (!user) {
                throw new NotFoundException();
            }

            request.user = user;
        } catch (error) {
            console.log(error)
            throw new UnauthorizedException();
        }

        return true;
    }
}