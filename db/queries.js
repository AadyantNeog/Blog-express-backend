const pool = require("./pool.js")

async function signupUser(username,email,password){
    await pool.query("INSERT INTO users (username,email,password_hash) VALUES ($1,$2,$3);",[username,email,password]);
}

async function checkUser(email){
    const {rows} = await pool.query("SELECT * FROM users WHERE email = $1", [email])
    return rows;
}


async function getAllposts(){
    const {rows} = await pool.query("SELECT * FROM posts;");
    return rows;
}
async function insertPost(user_id,title,content){
    const {rows} = await pool.query("INSERT INTO posts (user_id,title,content) VALUES ($1,$2,$3) RETURNING *;",[user_id,title,content])
    return rows;
}
async function getPost(postid){
    const {rows} = await pool.query("SELECT * FROM posts WHERE id = $1;", [postid]);
    return rows;
}



async function getPostComments(postid){
    const {rows} = await pool.query("SELECT * FROM comments where post_id = $1;", [postid]);
    return rows;
}
async function insertComment(postid, user_id, content){
    const {rows} = await pool.query("INSERT INTO comments (post_id,user_id,content) VALUES ($1,$2,$3) RETURNING *;", [postid,user_id,content])
    return rows;
}
async function deleteComment(commentid){
    await pool.query("DELETE FROM comments WHERE id = $1;", [commentid]);
}



async function deletePost(postid) {
    await pool.query("DELETE FROM posts WHERE id = $1;", [postid]);
}

module.exports = {
    signupUser,
    checkUser,
    getAllposts,
    insertPost,
    getPost,
    getPostComments,
    insertComment,
    deleteComment,
    deletePost
}