# Blog Backend Documentation

## Overview

This backend is an Express + PostgreSQL API for a blog/forum application called `The React Forum`.

It supports:

- user signup
- user login with JWT authentication
- creating posts
- listing all posts
- viewing a single post
- creating comments on posts
- liking and unliking posts
- liking and unliking comments
- fetching the logged-in user's own posts
- centralized error handling for route failures

## Tech Stack

- Node.js
- Express
- PostgreSQL
- `pg` for database access
- `jsonwebtoken` for auth
- `bcryptjs` for password hashing
- `cors` for cross-origin requests

## Folder Structure

### `app.js`

Main server entry point.

Responsibilities:

- creates the Express app
- registers shared middleware like JSON parsing and CORS
- mounts route modules
- registers the centralized error handler
- starts the server

### `routes/`

Defines the API endpoints and attaches middleware/controller functions.

Files:

- `routes/authRoutes.js`
- `routes/postRoutes.js`
- `routes/profileRoutes.js`

### `controllers/`

Controllers handle HTTP concerns only.

Responsibilities:

- read `req.params`, `req.body`, and `req.user`
- call the service layer
- send JSON responses
- forward errors with `next(error)` inside `try/catch`

Files:

- `controllers/authController.js`
- `controllers/postController.js`
- `controllers/commentController.js`

### `services/`

Services contain application/business logic.

Responsibilities:

- coordinate repository calls
- enforce app rules such as "post must exist" or "comment must belong to this post"
- build response-friendly objects when needed
- throw application errors that the centralized error handler can convert into HTTP responses

Files:

- `services/authService.js`
- `services/postService.js`
- `services/commentService.js`

### `repositories/`

Repositories contain database access logic.

Responsibilities:

- run SQL queries
- return database rows or simple data objects
- handle transactions for like toggles
- stay focused on persistence instead of HTTP concerns

Files:

- `repositories/userRepository.js`
- `repositories/postRepository.js`
- `repositories/commentRepository.js`
- `repositories/likeRepository.js`

### `middleware/`

Shared Express middleware.

Files:

- `middleware/auth.js`
  - `authenticateToken` requires a valid JWT
  - `attachUserIfPresent` attaches `req.user` when a valid JWT is present but still allows guests
- `middleware/errorHandler.js`
  - catches errors passed with `next(error)`
  - returns a consistent JSON response

### `utils/AppError.js`

A small custom error class used by services to attach HTTP status codes to expected application errors.

### `db/pool.js`

Creates and exports the PostgreSQL connection pool.

### `config.js`

Stores app configuration values such as:

- server port
- JWT secret
- database connection settings

### `schema.txt`

A simple schema snapshot showing the current database table shapes.

## Request Flow

A typical request now moves through these layers:

1. route
2. auth middleware if needed
3. controller
4. service
5. repository
6. database

Example for `POST /posts/:postid/like`:

1. `routes/postRoutes.js` matches the endpoint
2. `authenticateToken` ensures the user is logged in
3. `postController.togglePostLike` reads route/user data
4. `postService.togglePostLike` checks business rules
5. `likeRepository.togglePostLike` performs the transactional SQL work
6. the controller sends the JSON response

## Authentication Flow

### Signup

`POST /signup`

- receives `username`, `email`, `password`
- controller calls `authService.signupUser`
- service hashes the password with `bcryptjs`
- repository inserts the user into the `users` table

### Login

`POST /login`

- receives `email` and `password`
- controller calls `authService.loginUser`
- service loads the user by email
- service compares the provided password against `password_hash`
- service returns a JWT token on success

### Protected Routes

Routes that need a logged-in user use `authenticateToken`.

Behavior:

- reads `Authorization: Bearer <token>`
- verifies the JWT
- stores the decoded payload in `req.user`
- returns `401` when no token is present
- returns `403` when the token is invalid

### Optional Authentication

Some read routes use `attachUserIfPresent`.

Behavior:

- if a token exists and is valid, `req.user` is set
- if no token is present, `req.user` becomes `null`
- if the token is invalid, the request still continues with `req.user = null`

This is used so the API can return fields like `liked_by_user` when a user is logged in, while still working for guests.

## Centralized Error Handling

The app now uses one shared error middleware: `middleware/errorHandler.js`.

How it works:

- controllers use explicit `try/catch`
- inside `catch`, controllers call `next(error)`
- Express forwards the error to `errorHandler`
- the handler sends a consistent JSON response like `{ "message": "..." }`

Expected application errors are thrown from services with `AppError`.

Examples:

- `404` when a user is not found during login
- `404` when a post or comment does not exist
- `400` when `post_id` in the body does not match the route parameter

Unexpected errors fall back to `500 Internal Server Error`.

## API Routes

### Auth

- `POST /signup`
- `POST /login`

### Posts

- `GET /posts`
  - returns all posts
  - includes `username`
  - includes `liked_by_user` when a valid token is present
- `POST /posts`
  - protected
  - creates a new post
- `GET /posts/:postid`
  - returns a `post` array with zero or one item
  - includes `username`
  - includes `liked_by_user` when a valid token is present
- `POST /posts/:postid/like`
  - protected
  - toggles like/unlike for the logged-in user

### Comments

- `GET /posts/:postid/comments`
  - returns comments for a post
  - includes `username`
  - includes `liked_by_user` when a valid token is present
- `POST /posts/:postid/comments`
  - protected
  - creates a new comment
- `POST /posts/:postid/comments/:commentid/like`
  - protected
  - toggles like/unlike for the logged-in user

### Profile

- `GET /me/posts`
  - protected
  - returns the logged-in user's own posts

## Database Tables

### `users`

Stores registered users.

Important fields:

- `id`
- `username`
- `email`
- `password_hash`
- `created_at`

### `posts`

Stores forum posts.

Important fields:

- `id`
- `user_id`
- `title`
- `content`
- `is_published`
- `likes_count`
- `created_at`
- `updated_at`

### `comments`

Stores comments for posts.

Important fields:

- `id`
- `post_id`
- `user_id`
- `parent_id`
- `content`
- `likes_count`
- `created_at`

### `post_likes`

Stores which user liked which post.

Purpose:

- prevents duplicate likes
- supports unlike
- allows computing or validating `likes_count`

### `comment_likes`

Stores which user liked which comment.

Purpose:

- prevents duplicate likes
- supports unlike
- allows computing or validating `likes_count`

## Like System Design

The app uses two layers for likes:

1. relation tables: `post_likes` and `comment_likes`
2. cached counters: `posts.likes_count` and `comments.likes_count`

Why both exist:

- relation tables store the truth about which user liked what
- counter columns make reads faster for the frontend

The transactional like logic lives in `repositories/likeRepository.js` so the counter and relationship table stay in sync.

## Response Data Notes

Post and comment payloads can include:

- `username`
- `likes_count`
- `liked_by_user`

`liked_by_user` is especially useful for the frontend to know whether the current logged-in user has already liked the item.

## Current Feature Summary

Implemented features:

- account creation
- login
- JWT-based authentication
- create post
- list posts
- single post page data
- comment creation
- post likes
- comment likes
- profile page data for the logged-in user
- centralized error responses
- layered backend structure with routes, controllers, services, repositories, and middleware

Not implemented yet:

- delete/edit post UI and API flow
- delete/edit comment UI and API flow
- nested replies using `parent_id`
- "who liked this" display
- pagination
- request validation beyond the current manual checks

## How Backend Connects To Frontend

Frontend calls this backend at `http://localhost:3000`.

Examples:

- frontend login stores the JWT token in local storage
- frontend sends the token in the `Authorization` header
- backend reads the token and returns auth-aware fields like `liked_by_user`

## Maintenance Notes

If you add new backend features later, update:

- `schema.txt` when table shape changes
- this file when routes, features, or structure change
- frontend fetch logic if response shapes change
- the correct layer for the change:
  - routes for endpoints
  - controllers for HTTP handling
  - services for app rules
  - repositories for SQL
