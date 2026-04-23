const pool = require("../db/pool.js");

async function togglePostLike(postId, userId) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const insertResult = await client.query(
            `
            INSERT INTO post_likes (user_id, post_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
            RETURNING user_id;
            `,
            [userId, postId]
        );

        let liked;

        if (insertResult.rowCount > 0) {
            liked = true;
            await client.query(
                `
                UPDATE posts
                SET likes_count = likes_count + 1
                WHERE id = $1;
                `,
                [postId]
            );
        } else {
            liked = false;
            const deleteResult = await client.query(
                `
                DELETE FROM post_likes
                WHERE user_id = $1 AND post_id = $2
                RETURNING user_id;
                `,
                [userId, postId]
            );

            if (deleteResult.rowCount > 0) {
                await client.query(
                    `
                    UPDATE posts
                    SET likes_count = GREATEST(likes_count - 1, 0)
                    WHERE id = $1;
                    `,
                    [postId]
                );
            }
        }

        const { rows } = await client.query(
            `
            SELECT likes_count
            FROM posts
            WHERE id = $1;
            `,
            [postId]
        );

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

        const insertResult = await client.query(
            `
            INSERT INTO comment_likes (user_id, comment_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
            RETURNING user_id;
            `,
            [userId, commentId]
        );

        let liked;

        if (insertResult.rowCount > 0) {
            liked = true;
            await client.query(
                `
                UPDATE comments
                SET likes_count = likes_count + 1
                WHERE id = $1;
                `,
                [commentId]
            );
        } else {
            liked = false;
            const deleteResult = await client.query(
                `
                DELETE FROM comment_likes
                WHERE user_id = $1 AND comment_id = $2
                RETURNING user_id;
                `,
                [userId, commentId]
            );

            if (deleteResult.rowCount > 0) {
                await client.query(
                    `
                    UPDATE comments
                    SET likes_count = GREATEST(likes_count - 1, 0)
                    WHERE id = $1;
                    `,
                    [commentId]
                );
            }
        }

        const { rows } = await client.query(
            `
            SELECT likes_count
            FROM comments
            WHERE id = $1;
            `,
            [commentId]
        );

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

module.exports = {
    togglePostLike,
    toggleCommentLike
};
