const mysql = require('mysql');

const conn = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '0601',
        database: 'shifen'
    })
    //数据连接创建号
conn.connect();

module.exports = conn