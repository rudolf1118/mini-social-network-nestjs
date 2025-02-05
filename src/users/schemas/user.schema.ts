import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class User extends Document {
    @Prop({ required: true, index: true })
    username: string;

    @Prop({ required: true, index: true })
    name: string;

    @Prop({ required: true, index: true })
    surname: string;

    @Prop({ required: true, index: true })
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

    @Prop({ required: true, index: true })
    age: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
