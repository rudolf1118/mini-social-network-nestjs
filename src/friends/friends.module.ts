import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { UsersService } from '../users/users.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { UsersModule } from '../users/users.module';
import { FriendRequest, FriendRequestSchema } from './schemas/friend-request.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: FriendRequest.name, schema: FriendRequestSchema }
        ]),
        UsersModule
    ],
    controllers: [FriendsController],
    providers: [FriendsService],
    exports: [FriendsService]
})

export class FriendsModule {}
