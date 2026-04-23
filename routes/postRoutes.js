const express = require("express");
const postController = require("../controllers/postController.js");
const commentController = require("../controllers/commentController.js");
const { authenticateToken, attachUserIfPresent } = require("../middleware/auth.js");

const router = express.Router();

router.post("/posts", authenticateToken, postController.createPost);
router.get("/posts", attachUserIfPresent, postController.getPosts);
router.get("/posts/:postid", attachUserIfPresent, postController.getPost);
router.get("/posts/:postid/comments", attachUserIfPresent, commentController.getPostComments);
router.post("/posts/:postid/comments", authenticateToken, commentController.createComment);
router.post("/posts/:postid/like", authenticateToken, postController.togglePostLike);
router.post(
    "/posts/:postid/comments/:commentid/like",
    authenticateToken,
    commentController.toggleCommentLike
);

module.exports = router;
