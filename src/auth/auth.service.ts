import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthInput, TokenResponse } from '../common/types/common.types';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService) {}

    async generateToken(user: User): Promise<TokenResponse> {
        const payload = { sub: user._id, password: user.password, role: user.role };
        const token = this.jwtService.sign(payload);
        if (!token) {
            throw new BadRequestException('Token not generated');
        }
        const decoded = this.jwtService.decode(token);
        const expiry = decoded['exp'];
        return {
            access_token: token,
            user_id: user._id as string,
            expiry,
        };
    }

    async validateUser(input: AuthInput): Promise<User> {
        const user = await this.usersService.findUserByUsernameOrEmail(input?.username, input?.email);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async authenticate(input: AuthInput): Promise<User> {
        const user = await this.validateUser(input);

        if (!user) {
            throw new UnauthorizedException('Invalid username or email');
        }
        return user;

    }

    async register(candidate: CreateUserDto): Promise<TokenResponse> {
        const { password, ...rest } = candidate;
        const hashedPassword = await bcrypt.hash(password, 10);
        const createdUser = await this.usersService.createUsers({ ...rest, password: hashedPassword });
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