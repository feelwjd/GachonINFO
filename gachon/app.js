const express = require('express');
const session = require('express-session');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql');
const usersRouter = require('./routes/users');
const expressLayouts = require('express-ejs-layouts');
const crypto = require('crypto');
var bodyParser = require('body-parser')
var logger = require('../gachon/config/winston');
// process.env 의 secret 연결
dotenv.config();


const app = express();
function connect() {
    const db = mysql.createConnection({
        host: 'localhost',
        user: '2022ipp',
        password: process.env.DB_PW,
        database: '2_IPP',
        multipleStatements: true,
    });

    db.connect(err => {
        if (err) {
            console.log(err.message);
            setTimeout(connect(), 2000);
        }
        console.log("Connect!!")
    });

    // mysql 에러 발생 시 실행됨
    db.on('error', err => {
        console.log(err.message);

        // 장시간 미사용으로 연결이 끊겼을 때
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            return connect();
        } else {
            throw err;
        }
    });
};

connect();
app.use(morgan('dev'));
app.use(bodyParser.json())
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, 'public')));

//세션 처리
app.use(session({
    key: 'sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 2000 * 60 * 60 // 쿠키 유효기간 2시간
    }
}));

// json - 클라이언트에서 받은 데이터를 json으로 보내줄 경우 json으로 파싱해서 req.body로 데이터를 넣어준다.
app.use(express.json());
// urlencoded - 클라이언트에서 form submit으로 보낼 때 form parsing을 받을 때 쓰인다.
app.use(express.urlencoded({ extended: true }));

// 로그인 시 아래 4개의 미들웨어 필요
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use('/', usersRouter);

app.listen(process.env.PORT, () => {
    console.log(`Example app listening at http://localhost:${process.env.PORT}`);
}) //포트 PORT번에서 이 앱을 실행한다. 

// 404 처리 미들웨어
app.use((req, res, next) => {
    console.log('404 Error');
    res.status(404).render('pages/404');
});

// 에러 처리 미들웨어
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).render('pages/500');
});

module.exports = app;