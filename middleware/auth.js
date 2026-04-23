const jwt = require("jsonwebtoken");
const config = require("../config.js");

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "No token" });
    }

    jwt.verify(token, config.jwtSecret, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }

        req.user = user;
        next();
    });
}

function attachUserIfPresent(req, res, next) {
    const authHeader = req.headers.authorization;
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

module.exports = {
    authenticateToken,
    attachUserIfPresent
};
