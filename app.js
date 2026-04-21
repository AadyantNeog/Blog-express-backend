const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/posts");
app.post("/posts");
app.get("/posts/:postid")

app.get("/posts/:postid/comments");
app.post("/posts/:postid/comments")
app.delete("/post/:postid/comments/:commentid");


app.delete("posts/:postid");

app.listen(3000, () => {
    console.log("Server is listening on port 3000");
})