const pool = require("../db/pool.js");

async function listCommentsByPost(postId, userIdOrNull = null) {
    const { rows } = await pool.query(
        `
        SELECT
            comments.*,
            users.username,
            EXISTS (
                SELECT 1
                FROM comment_likes
                WHERE comment_likes.comment_id = comments.id
                AND comment_likes.user_id = $2
            ) AS liked_by_user
        FROM comments
        JOIN users ON users.id = comments.user_id
        WHERE comments.post_id = $1
        ORDER BY comments.created_at ASC;
        `,
        [postId, userIdOrNull]
    );

    return rows;
}

async function createComment(postId, userId, content) {
    const { rows } = await pool.query(
        `
        INSERT INTO comments (post_id, user_id, content)
        VALUES ($1, $2, $3)
        RETURNING *;
        `,
        [postId, userId, content]
    );

    return rows[0] ?? null;
}

async function findCommentById(commentId, userIdOrNull = null) {
    const { rows } = await pool.query(
        `
        SELECT
            comments.*,
            users.username,
            EXISTS (
                SELECT 1
                FROM comment_likes
                WHERE comment_likes.comment_id = comments.id
                AND comment_likes.user_id = $2
            ) AS liked_by_user
        FROM comments
        JOIN users ON users.id = comments.user_id
        WHERE comments.id = $1;
        `,
        [commentId, userIdOrNull]
    );

    return rows[0] ?? null;
}

module.exports = {
    listCommentsByPost,
    createComment,
    findCommentById
};
