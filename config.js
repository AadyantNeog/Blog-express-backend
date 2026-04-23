function requireEnv(name) {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}

const config = {
    databaseUrl: requireEnv("DATABASE_URL"),
    jwtSecret: requireEnv("JWT_SECRET"),
    port: Number(process.env.PORT || 3000),
};

module.exports = config;
