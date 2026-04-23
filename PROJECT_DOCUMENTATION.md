# Blog Backend Documentation

## Overview

This backend is an Express + PostgreSQL API for a blog/forum application called `The React Forum`.

It handles:

- user signup
- user login with JWT authentication
- creating posts
- listing all posts
- viewing a single post
- creating comments on posts
- liking and unliking posts
- liking and unliking comments
- fetching the logged-in user's own posts

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

Contains:

- Express app setup
- JSON/body parsing middleware
- CORS setup
- JWT auth middleware
- optional auth middleware for routes that can work with or without login
- all API route definitions

### `controllers/postControllers.js`

Contains the request handlers for the API.

Main responsibilities:

- validating some request conditions
- calling the database query layer
- shaping API responses
- handling login token generation

### `db/queries.js`

Contains all PostgreSQL queries and transaction logic.

Main responsibilities:

- user creation and lookup
- fetching posts and comments
- creating posts and comments
- toggling post likes
- toggling comment likes
- fetching the logged-in user's posts

### `db/pool.js`

Creates and exports the PostgreSQL connection pool.

### `config.js`

Stores app configuration values such as:

- server port
- JWT secret
- database connection settings

### `schema.txt`

A simple schema snapshot showing the current database table shapes.

## Authentication Flow

### Signup

`POST /signup`

- receives `username`, `email`, `password`
- hashes the password with `bcryptjs`
- inserts the user into the `users` table

### Login

`POST /login`

- checks whether the user exists by email
- compares the provided password against `password_hash`
- returns a JWT token on success

### Protected Routes

Routes that need a logged-in user use `authenticateToken`.

Behavior:

- reads `Authorization: Bearer <token>`
- verifies the JWT
- stores the decoded payload in `req.user`

### Optional Authentication

Some read routes use `attachUserIfPresent`.

Behavior:

- if a token exists and is valid, `req.user` is set
- if not, the request still continues

This is used so the API can return fields like `liked_by_user` when a user is logged in, while still working for guests.

## API Routes

### Auth

- `POST /signup`
- `POST /login`

### Posts

- `GET /posts`
  - returns all posts
  - includes `username`
  - includes `liked_by_user` if a valid token is present
- `POST /posts`
  - protected
  - creates a new post
- `GET /posts/:postid`
  - returns one post
  - includes `username`
  - includes `liked_by_user` if a valid token is present
- `POST /posts/:postid/like`
  - protected
  - toggles like/unlike for the logged-in user

### Comments

- `GET /posts/:postid/comments`
  - returns comments for a post
  - includes `username`
  - includes `liked_by_user` if a valid token is present
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

The toggle functions in `db/queries.js` use database transactions so like/unlike changes stay consistent.

## Important Query Functions

### User functions

- `signupUser`
- `checkUser`

### Post functions

- `getAllposts`
- `getPostsByUser`
- `insertPost`
- `getPost`
- `deletePost`
- `togglePostLike`

### Comment functions

- `getPostComments`
- `insertComment`
- `deleteComment`
- `toggleCommentLike`

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

Not implemented yet:

- delete/edit post UI and API flow
- delete/edit comment UI and API flow
- nested replies using `parent_id`
- "who liked this" display
- pagination
- validation/error formatting improvements

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
