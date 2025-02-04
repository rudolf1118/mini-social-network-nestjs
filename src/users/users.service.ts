import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { ObjectId } from 'mongodb';

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
}
