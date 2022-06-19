const util = require('util');
const mysql = require('mysql');

let pool = mysql.createPool({
    host: "localhost",
    user: "admin",
    password: "pwdpwd",
    database: "youtube",
});

pool.getConnection((err, connection) => {
    if (err) {
        throw err;
    }
    if (connection) connection.release();
    return;
});

pool.query = util.promisify(pool.query);

module.exports = pool;