import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class User extends Document {
    @Prop({ required: true })
    username: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    surname: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({enum: ['admin', 'user'], default: 'user', required: true})
    role: string;

    @Prop({ required: false, type: [{
        friendId: { type: String, required: true },
        addedAt: { type: Date, default: Date.now }
    }], default: [] })
    friends: Array<{
        friendId: string;
        addedAt: Date;
    }>;

    @Prop({ required: true })
    age: number;

    @Prop({
        type: [{
            senderId: { type: String, required: true },
            status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
            createdAt: { type: Date, default: Date.now }
        }],
        default: []
    })
    friendRequests: Array<{
        senderId: string;
        status: 'pending' | 'accepted' | 'declined';
        createdAt: Date;
    }>;
}

export const UserSchema = SchemaFactory.createForClass(User);
