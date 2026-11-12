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
- [Scripts](#scripts)
- [Testing](#testing)
- [API Reference](#api-reference)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Features

- **Authentication**: register and log in with bcrypt-hashed passwords and JWT tokens
- **Posts**: create posts with an optional image, paginated feed, single-post view
- **Likes and comments**: toggle likes, check like status, comment on posts
- **Friends**: send, accept, decline and withdraw requests, list friends, unfriend, search users with friendship status
- **Messaging**: one-to-one chat with paginated history
- **Profiles**: upload a profile image, view your own or another user's profile and posts
- **Cloud media**: images stored on **Cloudinary** (jpg, jpeg, png, gif, webp; 5 MB max)
- **Production-ready basics**: env validation on startup, Helmet security headers, configurable CORS, central error handling, graceful shutdown, health check and an automated test suite

## Tech Stack

| Layer          | Technology                               |
| -------------- | ---------------------------------------- |
| Runtime        | Node.js 18+                              |
| Framework      | Express 4                                |
| ORM / Database | Sequelize 6 · MySQL (mysql2)             |
| Auth           | JSON Web Tokens · bcrypt                 |
| Security       | Helmet · CORS allow-list                 |
| File uploads   | Multer · multer-storage-cloudinary       |
| Media hosting  | Cloudinary                               |
| Testing        | node:test · Supertest · SQLite (in-memory) |
| Hosting        | Railway (API and MySQL)                  |

## Project Structure

```
social-website-backend/
├── app.js                   # Express app: security, CORS, parsers, routes, error handling
├── bin/www                  # Server entry point: connects to the DB, then starts listening
├── config/
│   ├── env.js               # Loads and validates environment variables
│   ├── db.js                # Sequelize connection (URL or DB_* variables)
│   └── cloudinary.js        # Cloudinary client
├── controller/              # Request handlers
├── middleware/
│   ├── auth.js              # JWT verification
│   ├── multermiddleware.js  # Image upload to Cloudinary
│   └── errorHandler.js      # 404 and error responses
├── models/                  # Sequelize models and associations
├── routes/                  # Express routers, mounted under /api
├── scripts/sync-db.js       # Creates missing tables from the models
├── test/                    # API tests
└── utils/pagination.js      # Shared page/limit parsing
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- **MySQL** 8 (local or hosted)
- A [Cloudinary](https://cloudinary.com/) account (only needed for image uploads)

### Setup

```bash
git clone https://github.com/gm786h/social-website-backend.git
cd social-website-backend
npm install

# Create your local config and fill in the values
cp .env.example .env

# Create the tables in an empty database
npm run db:sync

# Start the dev server with auto-reload
npm run dev
```

The API is served at `http://localhost:3000/api`, and `GET /health` returns `{ "status": "ok" }`.

## Environment Variables

All variables are documented in [`.env.example`](.env.example).

| Variable                | Required | Description                                               |
| ----------------------- | :------: | --------------------------------------------------------- |
| `JWT_SECRET`            |    ✅    | Secret used to sign JWTs                                  |
| `DATABASE_URL`          |   ✅*    | MySQL URL, e.g. `mysql://user:pass@host:3306/db`          |
| `DATABASE_PRIVATE_URL`  |          | Railway's internal URL; takes priority over `DATABASE_URL` |
| `DB_HOST` `DB_PORT` `DB_USER` `DB_PASSWORD` `DB_NAME` | ✅* | Alternative to a connection URL |
| `PORT`                  |          | Port to listen on (default `3000`)                        |
| `NODE_ENV`              |          | `development` or `production`                             |
| `CORS_ORIGINS`          |          | Comma-separated allowed origins (defaults to the production frontend and `http://localhost:5173`) |
| `JWT_EXPIRES_IN`        |          | Token lifetime (default `1d`)                             |
| `DB_SYNC`               |          | `true` creates missing tables on startup (default `false`) |
| `DB_LOGGING`            |          | `true` logs SQL queries                                   |
| `CLOUDINARY_CLOUD_NAME` `CLOUDINARY_API_KEY` `CLOUDINARY_API_SECRET` | | Cloudinary credentials for uploads |

\* Provide either a connection URL or the `DB_*` variables. The server refuses to start if `JWT_SECRET` or the database settings are missing.

> **Never commit `.env` or real credentials.** `.env` is git-ignored; only `.env.example` is tracked.

## Database

Tables are defined by the Sequelize models in `models/`. To create them in a new database:

```bash
npm run db:sync            # create any missing tables (existing tables are untouched)
npm run db:sync -- --alter # also alter existing tables to match the models
```

The server does **not** change the schema on startup unless `DB_SYNC=true`.

| Model           | Table            | Key fields                                                     |
| --------------- | ---------------- | -------------------------------------------------------------- |
| `User`          | `users`          | `username`, `email` (unique), `password`, `profileImageUrl`, `profileImagePublicId` |
| `Post`          | `posts`          | `content`, `image`, `userId`                                   |
| `Comment`       | `comments`       | `content`, `userId`, `postId`                                  |
| `Like`          | `likes`          | `userId`, `postId`                                             |
| `FriendRequest` | `friendrequests` | `senderId`, `receiverId`, `status` (`pending` / `accepted` / `cancel`) |
| `Friend`        | `friends`        | `userId1`, `userId2`                                           |
| `Message`       | `messages`       | `senderId`, `receiverId`, `message`                            |

## Scripts

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `npm start`       | Start the server                         |
| `npm run dev`     | Start with nodemon (auto-reload)         |
| `npm run db:sync` | Create missing database tables           |
| `npm test`        | Run the API test suite                   |

## Testing

```bash
npm test
```

The tests run every endpoint group (auth, posts, likes, comments, friends, messages, profiles) against an **in-memory SQLite database**, so you don't need a MySQL server or Cloudinary account to run them.

## API Reference

All endpoints are prefixed with `/api`. 🔒 marks endpoints that require `Authorization: Bearer <token>`. List endpoints accept `page` and `limit` query parameters (`limit` is capped at 100).

### Auth — `/api/auth`

| Method | Endpoint     | Auth | Description                                       |
| ------ | ------------ | :--: | ------------------------------------------------- |
| POST   | `/register`  |      | Register. Body: `{ username, email, password }` (password ≥ 6 chars). Returns `{ token, user }` |
| POST   | `/login`     |      | Log in. Body: `{ email, password }`. Returns `{ token, user }` |

### Users — `/api/users`

| Method | Endpoint    | Auth | Description                                    |
| ------ | ----------- | :--: | ---------------------------------------------- |
| GET    | `/profile`  |  🔒  | Current user's account details                 |
| GET    | `/Post`     |  🔒  | A user's profile with paginated posts. Query: `userId` (defaults to you), `page`, `limit` |
| GET    | `/search`   |  🔒  | Search by username. Query: `name`. Each result has `status`: `none`, `friends`, `request_sent` or `request_received` |

### Profile — `/api/profile`

| Method | Endpoint           | Auth | Description                                      |
| ------ | ------------------ | :--: | ------------------------------------------------ |
| PUT    | `/upload-profile`  |  🔒  | Upload a profile image (multipart field `image`); replaces the previous one |
| GET    | `/me`              |  🔒  | Current user's username, email and profile image |

### Posts — `/api/posts`

| Method | Endpoint    | Auth | Description                                          |
| ------ | ----------- | :--: | ---------------------------------------------------- |
| POST   | `/`         |  🔒  | Create a post. Multipart: `content`, optional `image` |
| GET    | `/`         |  🔒  | Paginated feed, newest first. Returns `{ currentPage, totalPages, totalPosts, perPage, Posts }` |
| GET    | `/:postId`  |  🔒  | Get a post with its author, comments and likes       |

### Likes — `/api/likes`

| Method | Endpoint           | Auth | Description                         |
| ------ | ------------------ | :--: | ----------------------------------- |
| POST   | `/:postId/like`    |  🔒  | Toggle like. Returns `{ liked, likeCount }` |
| GET    | `/:postId/status`  |  🔒  | Returns `{ liked }` for the current user |

### Comments — `/api/comments`

| Method | Endpoint    | Auth | Description                          |
| ------ | ----------- | :--: | ------------------------------------ |
| POST   | `/:postId`  |  🔒  | Add a comment. Body: `{ content }`   |

### Friend Requests — `/api/Addfriend`

| Method | Endpoint     | Auth | Description                                    |
| ------ | ------------ | :--: | ---------------------------------------------- |
| POST   | `/send`      |  🔒  | Send a request. Body: `{ receiverId }`. If that user already sent you one, you become friends immediately |
| POST   | `/accept`    |  🔒  | Accept a request. Body: `{ senderId }`         |
| POST   | `/cancel`    |  🔒  | Decline a received request with `{ senderId }`, or withdraw a sent one with `{ receiverId }` |
| POST   | `/unfriend`  |  🔒  | Remove a friend. Body: `{ friendId }`          |
| GET    | `/received`  |  🔒  | Pending requests you received                  |
| GET    | `/sent`      |  🔒  | Pending requests you sent                      |
| GET    | `/friends`   |  🔒  | Your friends. Query: `page`, `limit`           |

### Messages — `/api/message`

| Method | Endpoint         | Auth | Description                                      |
| ------ | ---------------- | :--: | ------------------------------------------------ |
| POST   | `/`              |  🔒  | Send a message. Body: `{ receiverId, message }`  |
| GET    | `/:otherUserId`  |  🔒  | Chat history, oldest first. Query: `page`, `limit` (default 100) |

### Example

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"jane","email":"jane@example.com","password":"secret123"}'

# Create a post with an image
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer <token>" \
  -F "content=Hello world" \
  -F "image=@./photo.jpg"
```

## Authentication

Register and login both return a JWT signed with `JWT_SECRET`. Include it on protected requests:

```
Authorization: Bearer <token>
```

`middleware/auth.js` verifies the token and sets `req.user.id`.

## Error Handling

Errors are returned as JSON with a matching HTTP status:

| Status | Meaning                                               |
| ------ | ----------------------------------------------------- |
| `400`  | Invalid input (missing fields, bad upload, malformed JSON) |
| `401`  | Missing, invalid or expired token; wrong credentials  |
| `403`  | Origin not allowed by CORS                            |
| `404`  | Resource or route not found                           |
| `409`  | Email already registered                              |
| `500`  | Unexpected server error (details hidden in production) |

## Deployment

The API and its MySQL database are deployed on **Railway**.

1. Create a Railway project with a MySQL service.
2. Deploy this repository as a Node service; Railway runs `npm start`.
3. In the service variables, set `DATABASE_PRIVATE_URL` (reference the MySQL service's internal URL), `JWT_SECRET`, `NODE_ENV=production`, `CORS_ORIGINS` and the Cloudinary variables.
4. For a new database, deploy once with `DB_SYNC=true` to create the tables, then set it back to `false`.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and run `npm test`
4. Commit and push: `git push origin feature/my-feature`
5. Open a pull request
