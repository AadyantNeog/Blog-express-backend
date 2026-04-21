const db = require("../db/queries.js")

async function getPosts(req,res) {
    const posts = await db.getAllposts();
    res.json({posts: posts})
}





module.exports = {
    getPosts
}