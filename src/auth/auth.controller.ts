import { Controller, HttpCode, HttpStatus, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { TokenResponse } from './auth.service';

type AuthInput = {
    username?: string;
    email?: string;
    password: string;
}



@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.OK)

    @Post('login')
    login(@Body() input: AuthInput): Promise<TokenResponse> {
        return this.authService.login(input);
    }

    @UsePipes(new ValidationPipe())
    @Post('register')
    register(@Body() dto: CreateUserDto): Promise<TokenResponse> {
        return this.authService.register(dto);
    }
}
