import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FriendsModule } from './friends/friends.module';
import { GlobalExceptionFilter } from './common/filters/exception.filter';
import { APP_FILTER } from '@nestjs/core';

@Module({
  imports: [DatabaseModule, UsersModule, AuthModule, FriendsModule],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_FILTER,
    useClass: GlobalExceptionFilter
  }],
})
export class AppModule {}

