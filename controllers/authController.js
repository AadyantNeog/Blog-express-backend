const authService = require("../services/authService.js");

async function signupUser(req, res, next) {
    try {
        await authService.signupUser(req.body);
        res.status(201).json({
            message: "User created successfully"
        });
    } catch (error) {
        next(error);
    }
}

async function loginUser(req, res, next) {
    try {
        const result = await authService.loginUser(req.body);
        res.json({
            success: true,
            token: result.token
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    signupUser,
    loginUser
};
