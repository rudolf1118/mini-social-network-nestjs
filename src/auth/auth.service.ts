import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ObjectId } from 'mongoose';

type AuthInput = {
    username?: string;
    email?: string;
    password: string;
}
type CreateUserInput = {
    username: string;
    email: string;
    password: string;
    name: string;
    surname: string;
}

export type TokenResponse = {
    access_token: string;
    user_id: string | number | ObjectId;
}

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService) {}

    async generateToken(user: User): Promise<TokenResponse> {
        const payload = { sub: user._id, password: user.password, role: user.role };
        const token = this.jwtService.sign(payload);

        return {
            access_token: token,
            user_id: user._id as string
        };
    }

    async validateUser(input: AuthInput): Promise<User> {
        const user = await this.usersService.findUserByUsernameOrEmail(input?.username, input?.email);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async authenticate(input: AuthInput): Promise<any> {
        const user = await this.validateUser(input);

        if (!user) {
            throw new UnauthorizedException('Invalid username or email');
        }
        return user;

    }

    async register(candidate: CreateUserDto): Promise<TokenResponse> {
        console.log(candidate)
        const { password, ...rest } = candidate;
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword)
        const createdUser = await this.usersService.createUsers({ ...rest, password: hashedPassword });
        console.log(createdUser)
        if (!createdUser) {
            throw new BadRequestException('User not created');
        }
        return this.generateToken(createdUser);
    }

    async login(input: AuthInput): Promise<TokenResponse> {
        const user = await this.authenticate(input);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(input.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid password');
        }

        return this.generateToken(user);
    }
}