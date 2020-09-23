const result = require('../utils/result');
var session = require('express-session');
var { v4: uuidv4 } = require('uuid');
const userDao = require('../model/userDao');


module.exports = function(app) {
    app.use(session({
        genid: function(req) {
            return uuidv4() // use UUIDs for session IDs
        },
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 60000 }
    }));

    // session过滤器（ 中间件） 注需要放在静态资源后面
    app.use(function(req, res, next) {
        //  全局变量
        app.locals.user = req.session.user;

        const url = req.url;
        if (url.startsWith('/backend')) {
            if (req.session.user && req.session.user.role == 'admin') {
                next();
            } else if (req.session.user) {
                // 普通用户登录跳转到博客首页
                res.redirect('/posts');
            } else {
                res.redirect('/login');
            }
        } else {
            next();
        }
    })

    /* GET home page. */
    app.get('/', function(req, res) {
        res.render('backend')
    });

    app.get('/login', function(req, res) {
        res.render('login');
    });

    app.post('/login', function(req, res) {
        console.log(111);
        userDao.findUserByNameAndPsw(req.body.username, req.body.password, function(err, r) {
            if (err) {
                console.log(err);
                res.send(result.error('登录异常'));
                return;
            }
            if (r && r.length > 0) {
                req.session.user = Object.assign({}, r[0]);
                console.log(req.session.user)
                res.send(result.success('登陆成功'));
            } else {
                res.send(result.fail('登录失败'))
            }
        })
    });

    // 扩展路由
    app.use('/posts', require('./posts'))

    // 404 page
    app.use(function(req, res) {
        if (!res.headersSent) {
            res.status(404).render('404')
        }
    })
}