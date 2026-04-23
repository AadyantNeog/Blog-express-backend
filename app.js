const express = require("express");
const cors = require("cors")
const jwt = require("jsonwebtoken")
const config = require("./config.js")
const controllers = require("./controllers/postControllers.js")
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "No token" });
    }

    jwt.verify(token, config.jwtSecret, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }

        req.user = user; //user is the payload
        next();
    });
}

function attachUserIfPresent(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        req.user = null;
        return next();
    }

    jwt.verify(token, config.jwtSecret, (err, user) => {
        req.user = err ? null : user;
        next();
    });
}

app.post("/signup",controllers.signupUser);
app.post("/login", controllers.loginUser);

app.post("/posts",authenticateToken,controllers.postAPost);
app.get("/posts", attachUserIfPresent, controllers.getPosts);
app.get("/me/posts", authenticateToken, controllers.getMyPosts);
app.get("/posts/:postid", attachUserIfPresent, controllers.getPost);
app.get("/posts/:postid/comments", attachUserIfPresent, controllers.getPostComments);
app.post("/posts/:postid/comments",authenticateToken, controllers.postComment);
app.post("/posts/:postid/like", authenticateToken, controllers.togglePostLike);
app.post("/posts/:postid/comments/:commentid/like", authenticateToken, controllers.toggleCommentLike);
/*

app.delete("/post/:postid/comments/:commentid");
app.delete("posts/:postid");*/

app.listen(config.port, () => {
    console.log(`Server is listening on port ${config.port}`);
})
