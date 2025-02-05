import { NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
    constructor(userId: string) {
        super(`User with id ${userId} not found`);
    }
}

export class UserSearchException extends NotFoundException {
    constructor() {
        super(`User not found`);
    }
}