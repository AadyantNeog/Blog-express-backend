const db = require("../db/queries.js")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

async function getPosts(req,res) {
    const posts = await db.getAllposts();
    res.json({posts: posts})
}

async function getPost(req,res){
    const post = await db.getPost(req.params.postid);
    res.json({post: post});
}
async function getPostComments(req,res){
    const comments = await db.getPostComments(req.params.postid)
    res.json({comments: comments});
}

async function postComment(req,res){
    const comment = await db.insertComment(req.body.post_id,req.user.id,req.body.content);
    res.json({
        comment: comment
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

    jwt.sign({id: user.id,username: user.username,email: user.email}, 'firstWebsite', (err, token) => {
        if (err) return res.status(500).json({ success: false });
        res.json({
            success: true,
            token
        });
    });
}


module.exports = {
    loginUser,
    signupUser,
    getPosts,
    getPost,
    getPostComments,
    postComment
}