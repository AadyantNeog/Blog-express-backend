const commentService = require("../services/commentService.js");

async function getPostComments(req, res, next) {
    try {
        const comments = await commentService.getPostComments(
            req.params.postid,
            req.user?.id ?? null
        );

        res.json({ comments });
    } catch (error) {
        next(error);
    }
}

async function createComment(req, res, next) {
    try {
        const result = await commentService.createComment({
            postId: req.body.post_id,
            routePostId: req.params.postid,
            user: req.user,
            content: req.body.content
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
}

async function toggleCommentLike(req, res, next) {
    try {
        const result = await commentService.toggleCommentLike({
            postId: req.params.postid,
            commentId: req.params.commentid,
            userId: req.user.id
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getPostComments,
    createComment,
    toggleCommentLike
};
