const {Pool} = require("pg");

module.exports = new Pool({
    connectionString: "postgresql://aadyant:1547_psql@localhost:5432/top_blog"
})