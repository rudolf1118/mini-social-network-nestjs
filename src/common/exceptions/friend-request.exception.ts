import { ConflictException, NotFoundException } from '@nestjs/common';

export class FriendRequestException extends ConflictException {
    constructor(message: string) {
        super(message);
    }
}

export class FriendRequestNotFoundException extends NotFoundException {
    constructor(friendRequestId: string) {
        super(`Friend request with id ${friendRequestId} not found`);
    }
}