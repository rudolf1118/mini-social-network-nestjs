import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: '.env',
        }),
        MongooseModule.forRoot(process.env.MONGODB_SERVER as string),
    ],
    exports:[MongooseModule]
})
export class DatabaseModule {}
