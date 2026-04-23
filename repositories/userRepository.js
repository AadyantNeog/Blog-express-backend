const pool = require("../db/pool.js");

async function createUser(username, email, passwordHash) {
    await pool.query(
        "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3);",
        [username, email, passwordHash]
    );
}

async function findUserByEmail(email) {
    const { rows } = await pool.query(
        "SELECT * FROM users WHERE email = $1;",
        [email]
    );

    return rows[0] ?? null;
}

module.exports = {
    createUser,
    findUserByEmail
};
