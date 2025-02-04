import { IsNotEmpty, IsString, IsEmail, MinLength, Matches, IsNumber, Min } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    username: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    name: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    surname: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNumber()
    @Min(15)
    age: number;

    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d|\W).*$/, {
        message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number or special character'
    })
    password: string;
}