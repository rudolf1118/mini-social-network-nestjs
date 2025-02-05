# Mini Social Network API Documentation

This document provides an overview of the Mini Social Network API, including its features, architecture, and usage.

## Overview

The Mini Social Network API is a RESTful service built with NestJS, designed to handle user authentication, friend management, and user search functionalities.

## Technologies Used

- **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications.
- **MongoDB**: A NoSQL database used for storing user and friend data, accessed via Mongoose ODM.
- **JWT**: JSON Web Tokens for secure authentication and authorization.
- **Passport**: Middleware for handling authentication.
- **Class Validator**: For validating data transfer objects (DTOs).
- **bcrypt**: For hashing passwords securely.

## Architecture

The application follows the MVC (Model-View-Controller) pattern and Clean Architecture principles:

- **Controllers**: Handle HTTP requests and responses.
- **Services**: Contain business logic.
- **DTOs**: Define data transfer objects.
- **Schemas**: Define MongoDB models.
- **Guards**: Handle authentication.
- **Filters**: Handle global exception handling.

## Features

- User authentication (register/login)
- JWT-based authorization
- Friend request system
- User search functionality
- Global error handling

## API Endpoints

### Authentication

#### Register User

- **Endpoint**: `POST /api/auth/register`
- **Request Body**:
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "Password123!",
    "name": "John",
    "surname": "Doe",
    "age": 25
  }
  ```
- **Response**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1...",
    "user_id": "507f1f77bcf86cd799439011",
    "expiry": 3600
  }
  ```

#### Login

- **Endpoint**: `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "Password123!"
  }
  ```

### Users

#### Get Current User

- **Endpoint**: `GET /api/me`
- **Headers**: `Authorization: Bearer <token>`

#### Search Users

- **Endpoint**: `GET /api/search`
- **Query Parameters**: `username`, `email`, `age`, `name`, `surname`
- **Headers**: `Authorization: Bearer <token>`

### Friends

#### Send Friend Request

- **Endpoint**: `POST /api/friends/sendRequest`
- **Query Parameter**: `friendId`
- **Headers**: `Authorization: Bearer <token>`

#### Get Friend Requests

- **Endpoint**: `GET /api/friends/requests`
- **Headers**: `Authorization: Bearer <token>`

#### Action on Friend Request

- **Endpoint**: `GET /api/friends/actionRequest`
- **Query Parameters**: `requestId`, `friendId`, `status` (accept/decline/pending)
- **Headers**: `Authorization: Bearer <token>`

## Error Handling

The API uses a global exception filter to standardize error responses. Common HTTP status codes include:

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **409**: Conflict
- **500**: Internal Server Error

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create a `.env` file** with the following variables:
   ```
   MONGODB_SERVER=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```

4. **Run the development server**:
   ```bash
   npm run start:dev
   ```