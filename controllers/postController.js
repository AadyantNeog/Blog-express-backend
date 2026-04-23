const postService = require("../services/postService.js");

async function createPost(req, res, next) {
    try {
        const result = await postService.createPost({
            userId: req.user.id,
            title: req.body.title,
            content: req.body.content
        });

        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
}

async function getPosts(req, res, next) {
    try {
        const posts = await postService.getPosts(req.user?.id ?? null);
        res.json({ posts });
    } catch (error) {
        next(error);
    }
}

async function getMyPosts(req, res, next) {
    try {
        const result = await postService.getMyPosts(req.user);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

async function getPost(req, res, next) {
    try {
        const post = await postService.getPost(req.params.postid, req.user?.id ?? null);
        res.json({ post });
    } catch (error) {
        next(error);
    }
}

async function togglePostLike(req, res, next) {
    try {
        const result = await postService.togglePostLike({
            postId: req.params.postid,
            userId: req.user.id
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createPost,
    getPosts,
    getMyPosts,
    getPost,
    togglePostLike
};
