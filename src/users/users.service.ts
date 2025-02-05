import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UserNotFoundException, UserSearchException } from '../common/exceptions/index';
import { SearchQuery } from '../common/types/common.types';

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

    async findUserByUsernameOrEmail(username?: string, email?: string): Promise<User> {
        const user = await this.userModel.findOne({ $or: [{ username }, { email }] });
        if (!user) {
            throw new UserSearchException();
        }
        return user;
    }

    async getUserById(id: string): Promise<User> {
        const user = await this.userModel.findById(id);
        if (!user) {
            throw new UserNotFoundException(id);
        }
        return user;
    }
    async getUsersByIds(ids: string[]): Promise<User[]> {
        const users = await this.userModel
            .find({ _id: { $in: ids } })
            .select('-password -friendRequests')
            .exec();
        if (!users.length) {
            throw new UserSearchException();
        }
    
        return users;
    }

    async getUserByInfo(creeds: SearchQuery, userId: string): Promise<User[]> {
        const query = Object.keys(creeds).reduce((acc, key) => {
            if (creeds[key] !== undefined) {
                acc[key] = creeds[key];
            }
            return acc;
        }, {});
    
        if (Object.keys(query).length === 0) {
            throw new BadRequestException('At least one search parameter must be provided');
        }
    
        let users = await this.userModel.find(query);
        users = users.filter(user => user.id !== userId);

        if (users.length === 0) {
            throw new UserSearchException();
        }
    
        return users;
    }
}
