const express = require("express");
const cors = require("cors");
const config = require("./config.js");
const authRoutes = require("./routes/authRoutes.js");
const postRoutes = require("./routes/postRoutes.js");
const profileRoutes = require("./routes/profileRoutes.js");
const errorHandler = require("./middleware/errorHandler.js");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(authRoutes);
app.use(postRoutes);
app.use(profileRoutes);

app.use(errorHandler);

app.listen(config.port, () => {
    console.log(`Server is listening on port ${config.port}`);
});
