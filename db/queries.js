const pool = require("./pool.js")

async function signupUser(username,email,password){
    await pool.query("INSERT INTO users (username,email,password_hash) VALUES ($1,$2,$3);",[username,email,password]);
}

async function checkUser(email){
    const {rows} = await pool.query("SELECT * FROM users WHERE email = $1", [email])
    return rows;
}


async function getAllposts(userIdOrNull = null){
    const {rows} = await pool.query(`
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
    `, [userIdOrNull]);
    return rows;
}

async function getPostsByUser(userId){
    const {rows} = await pool.query(`
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
    `, [userId]);
    return rows;
}

async function insertPost(user_id,title,content){
    const {rows} = await pool.query("INSERT INTO posts (user_id,title,content) VALUES ($1,$2,$3) RETURNING *;",[user_id,title,content])
    return rows;
}
async function getPost(postid, userIdOrNull = null){
    const {rows} = await pool.query(`
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
    `, [postid, userIdOrNull]);
    return rows;
}



async function getPostComments(postid, userIdOrNull = null){
    const {rows} = await pool.query(`
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
    `, [postid, userIdOrNull]);
    return rows;
}
async function insertComment(postid, user_id, content){
    const {rows} = await pool.query(`
        INSERT INTO comments (post_id,user_id,content)
        VALUES ($1,$2,$3)
        RETURNING *;
    `, [postid,user_id,content])
    return rows;
}
async function deleteComment(commentid){
    await pool.query("DELETE FROM comments WHERE id = $1;", [commentid]);
}



async function deletePost(postid) {
    await pool.query("DELETE FROM posts WHERE id = $1;", [postid]);
}

async function togglePostLike(postId, userId) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const insertResult = await client.query(`
            INSERT INTO post_likes (user_id, post_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
            RETURNING user_id;
        `, [userId, postId]);

        let liked;

        if (insertResult.rowCount > 0) {
            liked = true;
            await client.query(`
                UPDATE posts
                SET likes_count = likes_count + 1
                WHERE id = $1;
            `, [postId]);
        } else {
            liked = false;
            const deleteResult = await client.query(`
                DELETE FROM post_likes
                WHERE user_id = $1 AND post_id = $2
                RETURNING user_id;
            `, [userId, postId]);

            if (deleteResult.rowCount > 0) {
                await client.query(`
                    UPDATE posts
                    SET likes_count = GREATEST(likes_count - 1, 0)
                    WHERE id = $1;
                `, [postId]);
            }
        }

        const { rows } = await client.query(`
            SELECT likes_count
            FROM posts
            WHERE id = $1;
        `, [postId]);

        await client.query("COMMIT");
        return {
            liked,
            likes_count: rows[0]?.likes_count ?? 0
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

async function toggleCommentLike(commentId, userId) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const commentResult = await client.query(`
            SELECT post_id
            FROM comments
            WHERE id = $1;
        `, [commentId]);

        if (commentResult.rowCount === 0) {
            throw new Error("Comment not found");
        }

        const insertResult = await client.query(`
            INSERT INTO comment_likes (user_id, comment_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
            RETURNING user_id;
        `, [userId, commentId]);

        let liked;

        if (insertResult.rowCount > 0) {
            liked = true;
            await client.query(`
                UPDATE comments
                SET likes_count = likes_count + 1
                WHERE id = $1;
            `, [commentId]);
        } else {
            liked = false;
            const deleteResult = await client.query(`
                DELETE FROM comment_likes
                WHERE user_id = $1 AND comment_id = $2
                RETURNING user_id;
            `, [userId, commentId]);

            if (deleteResult.rowCount > 0) {
                await client.query(`
                    UPDATE comments
                    SET likes_count = GREATEST(likes_count - 1, 0)
                    WHERE id = $1;
                `, [commentId]);
            }
        }

        const { rows } = await client.query(`
            SELECT likes_count, post_id
            FROM comments
            WHERE id = $1;
        `, [commentId]);

        await client.query("COMMIT");
        return {
            liked,
            likes_count: rows[0]?.likes_count ?? 0,
            post_id: rows[0]?.post_id ?? null
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    signupUser,
    checkUser,
    getAllposts,
    getPostsByUser,
    insertPost,
    getPost,
    getPostComments,
    insertComment,
    deleteComment,
    deletePost,
    togglePostLike,
    toggleCommentLike
}
