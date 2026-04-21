const express = require("express");
const cors = require("cors")
const jwt = require("jsonwebtoken")
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

    jwt.verify(token, "firstWebsite", (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }

        req.user = user; //user is the payload
        next();
    });
}

app.post("/signup",controllers.signupUser);
app.post("/login", controllers.loginUser);

app.get("/posts", controllers.getPosts);
app.get("/posts/:postid", controllers.getPost);
app.get("/posts/:postid/comments", controllers.getPostComments);
app.post("/posts/:postid/comments",authenticateToken, controllers.postComment)
/*app.post("/posts");



app.post("/posts/:postid/comments")
app.delete("/post/:postid/comments/:commentid");


app.delete("posts/:postid");*/

app.listen(3000, () => {
    console.log("Server is listening on port 3000");
})