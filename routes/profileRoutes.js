const express = require("express");
const postController = require("../controllers/postController.js");
const { authenticateToken } = require("../middleware/auth.js");

const router = express.Router();

router.get("/me/posts", authenticateToken, postController.getMyPosts);

module.exports = router;
