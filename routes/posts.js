var express = require('express');
var router = express.Router();

// 连接数据库
const db = require('../db');
const path = require('path');
const postsDao = require('../model/postsDao');
const userDao = require('../model/userDao');
const { log } = require('console');

// 博客首页
router.get('/', function(req, res) {
    console.log('session::user', req.session.user);
    // 查询数据
    var page = 1; //当前页
    if (req.query.page && !isNaN(req.query.page)) {
        page = req.query.page;
    }
    const pageTotal = 3; //每页显示的数量
    postsDao.countPosts(function(count) {
        if (count > 0) {
            postsDao.findPostsUserByPage(page, pageTotal, function(err, r) {
                if (err) {
                    console.log(err);
                    res.render('error');
                    return;
                }
                total = Math.ceil(count / pageTotal); //总页数
                var start = page - 2 <= 0 ? 1 : page - 2;
                var end = page + 2 > total ? total : page + 2;
                pageList = [];
                for (var i = start; i <= end; i++) {
                    pageList.push(i);
                }
                res.render('posts', { user: req.session.user, list: r, total, pageList, page });
            })
        } else {
            res.render('posts', { user: req.session.user, list: r, total: 0, pageList: [] });
        }
    })
});

// 管理员信息页面
router.get('/backend', function(req, res) {
    res.render('backend')
})

// 博客登录页面    
router.get('/login', function(req, res) {
    res.render('login');
});
router.post('/login', function(req, res) {
    //select * from user2 where username = ? and password=?
    db.query('select * from user2 where username = ? and password=?', [req.body.username, req.body.password], function(err, r) {
        if (err) {
            console.log(err);
            res.send({ code: 500, status: 'error', msg: '登录异常' });
            return;
        }
        if (r && r.length > 0) {
            // 登陆成功  把user对象保存到session里面
            // 同一个用户 不同的页面都可以访问
            req.session.user = Object.assign({}, r[0]);
            res.send({ code: 200, status: 'success', data: { username: 'zs' } });
        } else {
            res.send({ code: 500, status: 'error', msg: '用户名或密码输入错误' });
        }
    })
});

// 退出操作
router.get('/logout', function(req, res) {
    // req.session.user = null;
    req.session.destroy(function(err) {
        console.log('session对象被销毁');
    })
    res.redirect('/posts');
    // res.send('退出成功')
})

// 注册页面
router.get('/signup', function(req, res) {
    // 显示页面
    res.render('signup')
});


// 用户登录页面
router.get('/posts-login', function(req, res) {
    res.render('posts-login');
});
router.post('/signup', function(req, res) {
    // 表单数据
    console.log(req.body);
    // 文件
    console.log((req.files));
    var avatar = req.files.avatar;
    // 001.jpg 生成唯一的文件名，预防不同用户的图片覆盖
    var fileName = new Date().getTime() + avatar.name.substr(avatar.name.lastIndexOf('.'));
    var filePath = path.join(__dirname, '../public/face/', fileName);
    console.log(filePath);
    avatar.mv(filePath, function(err) {
        if (err) {
            console.log(err);
            res.send('注册异常');
        } else {
            req.body.face_url = './face/' + fileName;
            userDao.signup(req.body, function(err, r) {
                if (err) {
                    console.log(err);
                    res.send('注册异常');
                } else if (r.affectedRows > 0) {
                    // res.send('注册成功');
                    res.redirect('/posts/login')
                } else {
                    res.send('注册成功');
                }
            })
        }
    });
})

// 提示给富文本上传图片的接口
router.post('/upload', function(req, res) {
    console.log(req.files);
    // mv 把图片保存到指定位置
    // 响应的是json的结果
    if (req.files.file) {
        var fileName = new Date().getTime() + '.jpg';
        var filePath = path.join(__dirname, '../public/img', fileName)
        req.files.file.mv(filePath, function(err) {
            res.send({
                "code": 0,
                "msg": "上传成功",
                "data": {
                    "src": "./img/" + fileName
                }
            })
        })
    } else {
        res.send({
            code: 1,
            msg: '上传失败'
        })
    }
});


// 用户里面的增删改查
// 发表文章  增 create
router.get('/create', function(req, res) {
    res.render('create');
})
router.post('/create', function(req, res) {
    console.log('数据为', req.body);
    let sql = "insert into posts2(title,content,userid) values('" + req.body.title + "' , '" + req.body.content + "','2')";
    db.query(sql, function(err, r) {
        if (err) {
            console.log(err);
        } else {
            console.log('数据为', r);
            res.redirect('/posts')
        }
    })
})

// 修改  edit
var str = [];
router.get('/edit', function(req, res) {
    let sql = "select * from posts2 where id='" + req.query.id + "'";
    db.query(sql, function(err, r) {
        if (err) {
            console.log(err);
        } else {
            console.log('数据为', r);
            str = r;
            var num;
            if (!isNaN(req.query.id)) {
                for (var i = 0; i < str.length; i++) {
                    if (str[i].id == req.query.id) {
                        num = str[i];
                        break; //终止循环
                    }
                }
                res.render('edit', num);
            } else {
                res.send('id值不正确');
            }
        }
    })
});

router.post('/edit', function(req, res) {
    let sql = "update posts2 set title='" + req.body.title + "',content='" + req.body.content + "' where id='" + req.body.oldid + "'";
    db.query(sql, function(err, r) {
        if (err) {
            console.log(err);
        } else {
            console.log(r);
            res.redirect('/posts');
        }
    })
});

// 删除 remove
router.get('/remove', function(req, res) {
    let sql = "delete from posts where id = '" + req.query.id + "'";
    db.query(sql, function(err, r) {
        if (err) {
            console.log(err);
        } else {
            console.log('数据为：', r);
            res.redirect('/posts');
        }
    })
})


// 查询 

// 管理员的增删改查
// 管理员信息
router.get('/user-list', function(req, res) {
    console.log(1)
    let sql = 'select * from user2';
    db.query(sql, function(err, rows) {
        console.log(sql);
        console.log('数据为', rows);
        if (err) {
            res.json({
                err: '出错了'
            })
        } else {
            var list = rows;
            res.render('user-list', { list })
        }
    })
});

// 管理员对用户修改
var arr = [];
router.get('/user-update', function(req, res) {
    let sql = `select * from user2 where id='${req.query.id}'`;
    db.query(sql, function(err, r) {
        console.log(r);
        arr = r;
        var data;
        if (!isNaN(req.query.id)) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].id == req.query.id) {
                    data = arr[i];
                    break; //终止循环
                }
            }
            res.render('user-update', data);
        } else {
            res.send('id值不正确');
        }
    })
});
router.post('/user-update', function(req, res) {
    let sql = "update user2 set id='" + req.body.id + "',username='" + req.body.username + "',role='" + req.body.role + "',status='" + req.body.status + "',gender='" + req.body.gender + "' ,intro='" + req.body.intro + "' ,face_url='" + req.body.face_url + "' where id='" + req.body.oldId + "'";
    db.query(sql, function(err, r) {
        if (err) {
            console.log(err);
        } else {
            console.log(r);
            res.redirect('/posts/user-list');
        }
    })
});

// 管理员删除页面  对用户
router.get('/user-del', function(req, res) {
    let sql = "delete from user2 where id = '" + req.query.id + "'";
    db.query(sql, function(err, r) {
        if (err) {
            console.log(err);
        } else {
            console.log(r);
            res.redirect('/posts/user-list');
        }
    })
});


// 管理员查询页面 查询，搜索功能  对用户
router.post('/user-list', function(req, res) {
    let sql = 'select * from user2';
    db.query(sql, function(err, r) {
        if (err) {
            console.log(err);
        } else {
            arr = r;
            var srr = [];
            if (req.body.username) {
                arr.forEach(e => {
                    if (e.username.indexOf(req.body.username) >= 0) {
                        srr.push(e);
                    }
                });
                res.render('user-list', { list: srr })
            }
        }
    })
});

// 管理员对评论信息的增删改查
// 评论信息页面
router.get('/comment-list', function(req, res) {
    let sql = 'select * from comment2';
    db.query(sql, function(err, rows) {
        console.log('数据为', rows);
        if (err) {
            res.json({
                err: '出错了'
            })
        } else {
            var list = rows;
            res.render('comment-list', { list })
        }
    })
});

var a = [];

// 增
router.get('/comment-add', function(req, res) {
    res.render('comment-add')
})
router.post('/comment-add', function(req, res) {
    let sql = "insert into comment2(id,content,pid,userid) values('" + req.body.id + "','" + req.body.content + "','" + req.body.pid + "','" + req.body.userid + "')";
    db.query(sql, (err, rows) => {
        if (err) {
            console.log("错误1：" + err);
        }
        res.redirect('/posts/comment-list');
    })
});

// 修改
router.get('/comment-update', function(req, res) {
    let sql = "select * from comment2 where id='" + req.query.id + "'";
    db.query(sql, function(err, r) {
        if (err) {
            console.log(err);
        } else {
            a = r;
            console.log('数据是：', a);
            var count;
            if (!isNaN(req.query.id)) {
                for (var i = 0; i < a.length; i++) {
                    if (a[i].id == req.query.id) {
                        count = a[i];
                        console.log(count);
                        break; //终止循环
                    }
                }
                res.render('comment-update', count);
            } else {
                res.send('id值不正确');
            }
        }
    })
});
router.post('/comment-update', function(req, res) {
    let sql = "update comment2 set content='" + req.body.content + "' where id='" + req.body.oldid + "'";
    db.query(sql, function(err, r) {
        if (err) {
            console.log(err);
        } else {
            console.log(r);
            res.redirect('/posts/comment-list');
        }
    })
});

// 删除
router.get('/comment-del', function(req, res) {
    let sql = "delete from comment2 where id = '" + req.query.id + "'";
    db.query(sql, function(err, r) {
        if (err) {
            console.log(err);
        } else {
            console.log(r);
            res.redirect('comment-list');
        }
    })
});

// 查询
router.post('/comment-list', function(req, res) {
    let sql = 'select * from comment2';
    db.query(sql, function(err, r) {
        if (err) {
            console.log(err);
        } else {
            a = r;
            var srr = [];
            if (req.body.content) {
                a.forEach(e => {
                    if (e.content.indexOf(req.body.content) >= 0) {
                        srr.push(e);
                    }
                });
                res.render('comment-list', { list: srr })
            }
        }
    })
});

// 管理员对博文信息的增删改查
//博文信息页面
router.get('/post-list', function(req, res) {
    let sql = 'select * from posts2';
    db.query(sql, function(err, rows) {
        console.log(sql);
        console.log('数据为', rows);
        if (err) {
            res.json({
                err: '出错了'
            })
        } else {
            var list = rows;
            res.render('post-list', { list })
        }
    })
});

var math = [];

// 增
router.get('/post-add', function(req, res) {
    res.render('post-add')
})
router.post('/post-add', function(req, res) {
    let sql = "insert into posts2(id,title,content,userid,vistor) values('" + req.body.id + "','" + req.body.title + "','" + req.body.content + "','" + req.body.userid + "','" + req.body.vistor + "')";
    db.query(sql, (err, rows) => {
        if (err) {
            console.log("错误1：" + err);
        }
        res.redirect('post-list');
    })
});

// 修改
router.get('/post-update', function(req, res) {
    let sql = "select * from posts2 where id='" + req.query.id + "'";
    db.query(sql, function(err, r) {
        if (err) {
            console.log(err);
        } else {
            math = r;
            var count;
            if (!isNaN(req.query.id)) {
                for (var i = 0; i < math.length; i++) {
                    if (math[i].id == req.query.id) {
                        count = math[i];
                        break; //终止循环
                    }
                }
                res.render('post-update', count);
            } else {
                res.send('id值不正确');
            }
        }
    })
});
router.post('/post-update', function(req, res) {
    let sql = "update posts2 set title='" + req.body.title + "',content='" + req.body.content + "',vistor='" + req.body.vistor + "' where id='" + req.body.oldid + "'";
    db.query(sql, function(err, r) {
        if (err) {
            console.log(err);
        } else {
            console.log(r);
            res.redirect('/posts/post-list');
        }
    })
});

// 删除
router.get('/post-del', function(req, res) {
    let sql = "delete from posts2 where id = '" + req.query.id + "'";
    db.query(sql, function(err, r) {
        if (err) {
            console.log(err);
        } else {
            console.log('数据为：', r);
            res.redirect('post-del');
        }
    })
});

// 查询
router.post('/post-list', function(req, res) {
    let sql = 'select * from posts2';
    conn.query(sql, function(err, r) {
        if (err) {
            console.log(err);
        } else {
            math = r;
            var srr = [];
            if (req.body.name) {
                math.forEach(e => {
                    if (e.name.indexOf(req.body.name) >= 0) {
                        srr.push(e);
                    }
                });
                res.render('posts/post-list', { list: srr })
            }
        }
    })
});

module.exports = router;