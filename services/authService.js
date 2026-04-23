const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config.js");
const userRepository = require("../repositories/userRepository.js");
const AppError = require("../utils/AppError.js");

async function signupUser({ username, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await userRepository.createUser(username, email, hashedPassword);
}

async function loginUser({ email, password }) {
    const user = await userRepository.findUserByEmail(email);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
        throw new AppError("Invalid password", 401);
    }

    const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        config.jwtSecret
    );

    return { token };
}

module.exports = {
    signupUser,
    loginUser
};
