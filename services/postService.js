const postRepository = require("../repositories/postRepository.js");
const likeRepository = require("../repositories/likeRepository.js");
const AppError = require("../utils/AppError.js");

async function createPost({ userId, title, content }) {
    const post = await postRepository.createPost(userId, title, content);

    return {
        message: "Post created successfully",
        id: post?.id ?? null
    };
}

async function getPosts(userIdOrNull) {
    return postRepository.listPosts(userIdOrNull);
}

async function getMyPosts(user) {
    const posts = await postRepository.listPostsByUser(user.id);

    return {
        username: user.username,
        posts
    };
}

async function getPost(postId, userIdOrNull) {
    const post = await postRepository.findPostById(postId, userIdOrNull);
    return post ? [post] : [];
}

async function togglePostLike({ postId, userId }) {
    const post = await postRepository.findPostById(postId, userId);

    if (!post) {
        throw new AppError("Post not found", 404);
    }

    const result = await likeRepository.togglePostLike(postId, userId);

    return {
        message: result.liked ? "Post liked" : "Post unliked",
        liked: result.liked,
        likes_count: result.likes_count
    };
}

module.exports = {
    createPost,
    getPosts,
    getMyPosts,
    getPost,
    togglePostLike
};
