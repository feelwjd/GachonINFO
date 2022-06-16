var path = require('path');
var logger = require('morgan');
const mysql = require('mysql');
const { response } = require('express');
var sendRouter = require('./routes/cunivdata');
var bodyParser = require('body-parser')
var logger = require('../cuniv/config/winston');
const express = require('express') //③번 단계에서 다운받았던 express 모듈을 가져온다.
const dotenv = require('dotenv');
dotenv.config();

const app = express() //가져온 express 모듈의 function을 이용해서 새로운 express 앱을 만든다. 🔥
const port = process.env.PORT; //포트는 4000번 해도되고, 5000번 해도 된다. -> 이번엔 5000번 포트를 백 서버로 두겠다.


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
}) //포트 5000번에서 이 앱을 실행한다. 

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

app.get('/', (req, res) => { //express 앱(app)을 넣고, root directory에 오면, 
    res.send('Hello World') //"Hello World!" 를 출력되게 해준다.
})


//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/cunivdata', sendRouter);

module.exports = app;