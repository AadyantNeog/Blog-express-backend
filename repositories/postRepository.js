const pool = require("../db/pool.js");

async function listPosts(userIdOrNull = null) {
    const { rows } = await pool.query(
        `
        SELECT
            posts.*,
            users.username,
            EXISTS (
                SELECT 1
                FROM post_likes
                WHERE post_likes.post_id = posts.id
                AND post_likes.user_id = $1
            ) AS liked_by_user
        FROM posts
        JOIN users ON users.id = posts.user_id
        ORDER BY posts.created_at DESC;
        `,
        [userIdOrNull]
    );

    return rows;
}

async function listPostsByUser(userId) {
    const { rows } = await pool.query(
        `
        SELECT
            posts.*,
            users.username,
            EXISTS (
                SELECT 1
                FROM post_likes
                WHERE post_likes.post_id = posts.id
                AND post_likes.user_id = $1
            ) AS liked_by_user
        FROM posts
        JOIN users ON users.id = posts.user_id
        WHERE posts.user_id = $1
        ORDER BY posts.created_at DESC;
        `,
        [userId]
    );

    return rows;
}

async function createPost(userId, title, content) {
    const { rows } = await pool.query(
        "INSERT INTO posts (user_id, title, content) VALUES ($1, $2, $3) RETURNING *;",
        [userId, title, content]
    );

    return rows[0] ?? null;
}

async function findPostById(postId, userIdOrNull = null) {
    const { rows } = await pool.query(
        `
        SELECT
            posts.*,
            users.username,
            EXISTS (
                SELECT 1
                FROM post_likes
                WHERE post_likes.post_id = posts.id
                AND post_likes.user_id = $2
            ) AS liked_by_user
        FROM posts
        JOIN users ON users.id = posts.user_id
        WHERE posts.id = $1;
        `,
        [postId, userIdOrNull]
    );

    return rows[0] ?? null;
}

module.exports = {
    listPosts,
    listPostsByUser,
    createPost,
    findPostById
};
