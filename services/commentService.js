const commentRepository = require("../repositories/commentRepository.js");
const likeRepository = require("../repositories/likeRepository.js");
const AppError = require("../utils/AppError.js");

async function getPostComments(postId, userIdOrNull) {
    return commentRepository.listCommentsByPost(postId, userIdOrNull);
}

async function createComment({ postId, routePostId, user, content }) {
    if (postId && String(postId) !== String(routePostId)) {
        throw new AppError("post_id does not match route parameter", 400);
    }

    const comment = await commentRepository.createComment(routePostId, user.id, content);

    return {
        comment: [
            {
                ...comment,
                username: user.username,
                liked_by_user: false
            }
        ]
    };
}

async function toggleCommentLike({ postId, commentId, userId }) {
    const comment = await commentRepository.findCommentById(commentId, userId);

    if (!comment || String(comment.post_id) !== String(postId)) {
        throw new AppError("Comment not found", 404);
    }

    const result = await likeRepository.toggleCommentLike(commentId, userId);

    return {
        message: result.liked ? "Comment liked" : "Comment unliked",
        liked: result.liked,
        likes_count: result.likes_count
    };
}

module.exports = {
    getPostComments,
    createComment,
    toggleCommentLike
};
