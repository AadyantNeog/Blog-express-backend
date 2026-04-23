const db = require("../db/queries.js")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const config = require("../config.js")

async function postAPost(req,res){
    const rows = await db.insertPost(req.user.id,req.body.title,req.body.content)
    res.status(201).json({
        message: "Post created successfully",
        id: rows[0].id
    });
}
async function getPosts(req,res) {
    const posts = await db.getAllposts(req.user?.id ?? null);
    res.json({posts: posts})
}

async function getMyPosts(req, res) {
    const posts = await db.getPostsByUser(req.user.id);
    res.json({
        username: req.user.username,
        posts
    });
}

async function getPost(req,res){
    const post = await db.getPost(req.params.postid, req.user?.id ?? null);
    res.json({post: post});
}
async function getPostComments(req,res){
    const comments = await db.getPostComments(req.params.postid, req.user?.id ?? null)
    res.json({comments: comments});
}

async function postComment(req,res){
    if (req.body.post_id && String(req.body.post_id) !== String(req.params.postid)) {
        return res.status(400).json({
            message: "post_id does not match route parameter"
        });
    }

    const comment = await db.insertComment(req.params.postid,req.user.id,req.body.content);
    res.json({
        comment: comment.map((entry) => ({
            ...entry,
            username: req.user.username,
            liked_by_user: false
        }))
    })
}
async function signupUser(req,res) {
    const {password,email,username} = req.body;
    const hashedpassword = await bcrypt.hash(password,10)
    await db.signupUser(username,email,hashedpassword);
    res.status(201).json({
        message: "User created successfully"
    });
}
async function loginUser(req,res){
    const {password,email} = req.body;
    const rows = await db.checkUser(email);
    if(rows.length === 0){
        res.status(404).json({ success: false, message: 'User not found' });
        return;
    }
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid password' });
      return;
    }

    jwt.sign({id: user.id,username: user.username,email: user.email}, config.jwtSecret, (err, token) => {
        if (err) return res.status(500).json({ success: false });
        res.json({
            success: true,
            token
        });
    });
}

async function togglePostLike(req, res) {
    const post = await db.getPost(req.params.postid, req.user.id);

    if (post.length === 0) {
        return res.status(404).json({ message: "Post not found" });
    }

    const result = await db.togglePostLike(req.params.postid, req.user.id);

    res.json({
        message: result.liked ? "Post liked" : "Post unliked",
        liked: result.liked,
        likes_count: result.likes_count
    });
}

async function toggleCommentLike(req, res) {
    const comments = await db.getPostComments(req.params.postid, req.user.id);
    const commentExists = comments.some((comment) => String(comment.id) === String(req.params.commentid));

    if (!commentExists) {
        return res.status(404).json({ message: "Comment not found" });
    }

    const result = await db.toggleCommentLike(req.params.commentid, req.user.id);

    res.json({
        message: result.liked ? "Comment liked" : "Comment unliked",
        liked: result.liked,
        likes_count: result.likes_count
    });
}


module.exports = {
    postAPost,
    loginUser,
    signupUser,
    getPosts,
    getMyPosts,
    getPost,
    getPostComments,
    postComment,
    togglePostLike,
    toggleCommentLike
}
