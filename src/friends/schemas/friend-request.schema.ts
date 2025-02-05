import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


@Schema()
export class FriendRequest extends Document {
    @Prop({required: true})
    senderId: string;

    @Prop({required: true})
    receiverId: string;

    @Prop({enum: ['pending', 'accepted', 'declined'], default: 'pending'})
    status: string;

    @Prop({ default: Date.now })
    createdAt: Date;
}

export const FriendRequestSchema = SchemaFactory.createForClass(FriendRequest);