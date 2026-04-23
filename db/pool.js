const {Pool} = require("pg");
const config = require("../config.js");

module.exports = new Pool({
    connectionString: config.databaseUrl
})
