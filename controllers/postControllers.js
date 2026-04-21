const db = require("../db/queries.js")

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
    const comment = await db.insertComment(req.body.post_id,req.body.user_id,req.body.content);
    res.json({
        comment: comment
    })
}


module.exports = {
    getPosts,
    getPost,
    getPostComments,
    postComment
}