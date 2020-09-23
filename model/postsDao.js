const db = require('../db');

// 查询所有的帖子输出
exports.findPosts = function(callback) {
    db.query(`SELECT id,title,content,userid,DATE_FORMAT(createtime,'%Y-%m-%d %H:%m:%s') createtime FROM posts2`, callback);
}

exports.findPostsAndUser = function(callback) {
    db.query(`SELECT a.id,b.id uid,b.username,b.gender,b.intro,b.face_url,title,content,
    userid,DATE_FORMAT(a.createtime,'%Y-%m-%d %H:%m:%s') createtime ,a.vistor,(select count(*) from comment2 c where a.id=c.id) 
    comment_count FROM posts2 a inner join user2 b on a.userid = b.id`, callback);
}


exports.findPostsUserByPage = function(page, pageTotla, callback) {
    db.query(`SELECT a.id,b.id uid,b.username,b.gender,b.intro,b.face_url,title,content,
    userid,DATE_FORMAT(a.createtime,'%Y-%m-%d %H:%m:%s') createtime ,a.vistor,(select count(*) from comment2 c where a.id=c.id) 
    comment_count FROM posts2 a inner join user2 b on a.userid = b.id limit ?,?`, [(page - 1) * pageTotla, pageTotla], callback);
}


exports.countPosts = function(cb) {
    db.query('select count(*) amount from posts2', function(err, result) {
        if (err) {
            console.log(err);
            cb(-1);
        }
        console.log(result);
        if (result && result.length > 0) {
            cb(result[0]['amount']);
        }
    });
}