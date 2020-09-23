const conn = require('../db');

// 查询所有的用户输出
exports.findUsers = function(callback) {
    conn.query(`select id,username,status,role,date_format( create_time, '%Y-%m-%d' ) create_time from user2`, callback);
}

// 根据所有的用户名和密码查询
exports.findUserByNameAndPsw = function(username, password, callback) {
    conn.query('select * from user2 where username=? and  password=?', [username, password], callback);
}

// 根据id主键去查询
exports.findUserById = function(id, callback) {
    conn.query('select * from user2 where id=?', id, callback);
}

// 根据名称去查询
exports.findUserByName = function(name, cb) {
    conn.query('select * from user2 where username=?', name, cb);
}

exports.signup = function(param, cb) {
    conn.query('insert into user2 set?', param, cb);
}