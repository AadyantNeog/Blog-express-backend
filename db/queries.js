const pool = require("./pool.js")

async function getAllposts(){
    const {rows} = await pool.query("SELECT * FROM posts;");
    return rows;
}
async function insertPost(){

}
async function getPost(postid){
    const {rows} = await pool.query("SELECT * FROM posts WHERE id = $1;", [postid]);
    return rows;
}



async function getPostComments(postid){
    const {rows} = await pool.query("SELECT * FROM comments where post_id = $1;", [postid]);
    return rows;
}
async function insertComment(){

}
async function deleteComment(commentid){
    await pool.query("DELETE FROM comments WHERE id = $1;", [commentid]);
}



async function deletePost(postid) {
    await pool.query("DELETE FROM posts WHERE id = $1;", [postid]);
}