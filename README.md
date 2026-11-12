# Social Website Backend

The REST API behind the [Social Website](https://social-website-ty79.vercel.app) frontend. Built with **Node.js**, **Express** and **Sequelize** on **MySQL**, it provides authentication, posts with image uploads, likes, comments, friend requests, direct messaging and user profiles.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [API Reference](#api-reference)
- [Authentication](#authentication)
- [CORS](#cors)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Features

- **Authentication**: register and log in with bcrypt-hashed passwords and JWT tokens
- **Posts**: create posts with an optional image, paginated feed, single-post view
- **Likes and comments**: like or unlike posts, check like status, comment on posts
- **Friends**: send, accept and cancel requests, view sent and received requests, unfriend, list friends
- **Messaging**: one-to-one chat with paginated history
- **Profiles**: upload and fetch profile images, view your own or another user's profile, search users
- **Cloud media**: images stored on **Cloudinary** (jpg, jpeg, png, gif, webp)

## Tech Stack

| Layer          | Technology                               |
| -------------- | ---------------------------------------- |
| Runtime        | Node.js                                  |
| Framework      | Express 4                                |
| ORM / Database | Sequelize 6 · sequelize-cli · MySQL (mysql2) |
| Auth           | JSON Web Tokens · bcrypt                 |
| File uploads   | Multer · multer-storage-cloudinary       |
| Media hosting  | Cloudinary                               |
| Utilities      | dotenv · cors · morgan · nodemon         |
| Hosting        | Railway (API and MySQL)                  |

## Project Structure

```
social-website-backend/
├── app.js                  # Express app: CORS, middleware, route mounting
├── bin/www                 # Server entry point (verifies DB, then starts HTTP server)
├── config/db.js            # Sequelize connection with retry and fallback logic
├── controller/             # Request handlers (auth, post, like, comment, friend, message, profile, user)
├── middleware/
│   ├── auth.js             # JWT verification
│   └── multermiddleware.js # Multer + Cloudinary storage
├── models/                 # Sequelize models and associations
├── migrations/             # sequelize-cli migrations
├── routes/                 # Express routers, mounted under /api
├── sqdbs.sql               # SQL schema
└── local_dump.sql          # Local database dump
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- **MySQL** 8 (local or hosted)
- A [Cloudinary](https://cloudinary.com/) account

### Installation

```bash
git clone https://github.com/gm786h/social-website-backend.git
cd social-website-backend
npm install
```

### Configuration

Create a `.env` file in the project root (see [Environment Variables](#environment-variables)), then set up the database (see [Database](#database)).

### Run

```bash
# Development (auto-reload with nodemon)
npm run dev

# Production
npm start
```

The API is served at `http://localhost:3000/api` by default.

## Environment Variables

| Variable                | Description                                          |
| ----------------------- | ---------------------------------------------------- |
| `PORT`                  | Port the server listens on (default `3000`)          |
| `DATABASE_URL`          | MySQL connection URL, e.g. `mysql://user:pass@host:3306/db` |
| `DATABASE_PRIVATE_URL`  | Internal connection URL (preferred on Railway)       |
| `JWT_SECRET`            | Secret used to sign JWTs                             |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name                                |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                                   |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                                |

The connection uses `DATABASE_PRIVATE_URL` first and falls back to `DATABASE_URL`.

> **Never commit your `.env` file or credentials.** Keep secrets in environment variables only.

## Database

The server **does not** run `sequelize.sync()`; it expects the schema to already exist. Set it up in one of these ways:

```bash
# Option 1: import the SQL schema
mysql -u <user> -p <database> < sqdbs.sql

# Option 2: restore the local dump
mysql -u <user> -p <database> < local_dump.sql

# Apply pending migrations
npx sequelize-cli db:migrate
```

### Models

| Model           | Table            | Key fields                                                     |
| --------------- | ---------------- | -------------------------------------------------------------- |
| `User`          | `users`          | `username`, `email` (unique), `password`, `profileImageUrl`, `profileImagePublicId` |
| `Post`          | `posts`          | `content`, `image`, `userId`                                   |
| `Comment`       | `comments`       | `content`, `userId`, `postId`                                  |
| `Like`          | `likes`          | `userId`, `postId`                                             |
| `FriendRequest` | `friendrequests` | `senderId`, `receiverId`, status                               |
| `Friend`        | `friends`        | user-to-user friendship                                        |
| `Message`       | `messages`       | `senderId`, `receiverId`, `message`                            |

## API Reference

All endpoints are prefixed with `/api`. 🔒 marks endpoints that require `Authorization: Bearer <token>`.

### Auth — `/api/auth`

| Method | Endpoint     | Auth | Description                                       |
| ------ | ------------ | :--: | ------------------------------------------------- |
| POST   | `/register`  |      | Register. Body: `{ username, email, password }`   |
| POST   | `/login`     |      | Log in and receive a JWT. Body: `{ email, password }` |

### Users — `/api/users`

| Method | Endpoint    | Auth | Description                                    |
| ------ | ----------- | :--: | ---------------------------------------------- |
| GET    | `/profile`  |  🔒  | Current user's profile and posts. Query: `page`, `limit` |
| GET    | `/Post`     |  🔒  | Another user's profile                         |
| GET    | `/search`   |  🔒  | Search users. Query: `name`                    |

### Profile — `/api/profile`

| Method | Endpoint           | Auth | Description                                      |
| ------ | ------------------ | :--: | ------------------------------------------------ |
| PUT    | `/upload-profile`  |  🔒  | Upload a profile image (multipart field `image`) |
| GET    | `/me`              |  🔒  | Get the current user's profile image             |

### Posts — `/api/posts`

| Method | Endpoint    | Auth | Description                                          |
| ------ | ----------- | :--: | ---------------------------------------------------- |
| POST   | `/`         |  🔒  | Create a post. Multipart: `content`, optional `image` |
| GET    | `/`         |  🔒  | Paginated feed. Query: `page`, `limit`               |
| GET    | `/:postId`  |  🔒  | Get a post by ID                                     |

### Likes — `/api/likes`

| Method | Endpoint           | Auth | Description                         |
| ------ | ------------------ | :--: | ----------------------------------- |
| POST   | `/:postId/like`    |  🔒  | Like or unlike a post               |
| GET    | `/:postId/status`  |  🔒  | Check whether the current user liked a post |

### Comments — `/api/comments`

| Method | Endpoint    | Auth | Description                          |
| ------ | ----------- | :--: | ------------------------------------ |
| POST   | `/:postId`  |  🔒  | Add a comment. Body: `{ content }`   |

### Friend Requests — `/api/Addfriend`

| Method | Endpoint     | Auth | Description                                    |
| ------ | ------------ | :--: | ---------------------------------------------- |
| POST   | `/send`      |  🔒  | Send a request. Body: `{ receiverId }`         |
| POST   | `/accept`    |  🔒  | Accept a request. Body: `{ senderId }`         |
| POST   | `/cancel`    |  🔒  | Cancel or decline a request. Body: `{ senderId }` |
| POST   | `/unfriend`  |  🔒  | Remove a friend. Body: `{ friendId }`          |
| GET    | `/received`  |  🔒  | List received requests                         |
| GET    | `/sent`      |  🔒  | List sent requests                             |
| GET    | `/friends`   |  🔒  | List friends. Query: `page`, `limit`           |

### Messages — `/api/message`

| Method | Endpoint         | Auth | Description                                      |
| ------ | ---------------- | :--: | ------------------------------------------------ |
| POST   | `/`              |  🔒  | Send a message. Body: `{ receiverId, message }`  |
| GET    | `/:otherUserId`  |  🔒  | Chat history. Query: `page`, `limit`             |

### Example

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"jane","email":"jane@example.com","password":"secret123"}'

# Fetch the feed
curl http://localhost:3000/api/posts?page=1&limit=10 \
  -H "Authorization: Bearer <token>"
```

## Authentication

`POST /api/auth/login` returns a JWT signed with `JWT_SECRET`. Include it on protected requests:

```
Authorization: Bearer <token>
```

`middleware/auth.js` verifies the token and puts the decoded payload on `req.user`.

## CORS

Only these origins are allowed (configured in `app.js`):

- `https://social-website-ty79.vercel.app` (production frontend)
- `http://localhost:5173` (local Vite dev server)

Add your origin to `allowedOrigins` in `app.js` to call the API from anywhere else.

## Deployment

The API and its MySQL database are deployed on **Railway**.

1. Create a Railway project with a MySQL service.
2. Deploy this repository as a Node service; Railway runs `npm start`.
3. Set `DATABASE_PRIVATE_URL` (Railway's internal MySQL URL), `JWT_SECRET` and the Cloudinary variables in the service settings.
4. Import the schema into the Railway database (see [Database](#database)).

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push the branch: `git push origin feature/my-feature`
5. Open a pull request
