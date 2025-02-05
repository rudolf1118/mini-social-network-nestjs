import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
    ) {}

    async createUsers (createUserDto: CreateUserDto): Promise<User> {
        const user = await this.userModel.findOne({ $or: [{ username: createUserDto.username }, { email: createUserDto.email }] });
        if (user) {
            throw new ConflictException('User already exists');
        }
        const createdUser = new this.userModel(createUserDto);
        return createdUser.save();
    }

    async findUserByUsernameOrEmail(username: string | undefined, email: string | undefined): Promise<User | null> {
        const user = await this.userModel.findOne({ $or: [{ username }, { email }] });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async getUserById(id: string): Promise<User | null> {
        const user = await this.userModel.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }
    async getUsersByIds(ids: string[]): Promise<any> {
        const users = await this.userModel.find({ _id: { $in: ids } });
        if (!users) {
            throw new NotFoundException('Users not found');
        }
        return {
            status: 'success',
            users,
        };
    }

    async getUserByInfo(creds: { username?: string, email?: string, age?: number, name?:string, surname?:string }): Promise<User[] | null> {
        const query = {};
        if (creds.username) query['username'] = creds.username;
        if (creds.email) query['email'] = creds.email;
        if (creds.age) query['age'] = creds.age;
        if (creds.name) query['name'] = creds.name;
        if (creds.surname) query['surname'] = creds.surname;
        const user = await this.userModel.find({ $and: [query] });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }
}
