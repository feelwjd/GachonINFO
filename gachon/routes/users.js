var express = require('express');
const app = require('../app');
const { encrypt, decrypt } = require('./crypto');
const { scheduleValidation } = require('./schedule');
var router = express.Router();
const mysql = require('mysql');
const e = require('express');
const multer = require("multer");
const path = require("path");
const { CONNREFUSED } = require('dns');
const crypto = require('crypto');
router.use(express.json());
var request = require('request');
var logger = require('../config/winston');
var fs = require('fs');
const { json } = require('body-parser');
const { readLog, readErrorLog, ErrorfileName, LogfileName, ErrorfileList, LogfileList } = require('./logsearch');

const con = mysql.createConnection({
    host: 'localhost',
    user: '2022ipp',
    password: process.env.DB_PW,
    database: '2_IPP',
    multipleStatements: true,
});

con.connect();

//회원가입 GET
router.get('/signup', function (req, res, next) {
    let session = req.session;
    res.render("pages/signup", {
        session: session
    });
})
//회원가입 POST
router.post('/signup', function (req, res, next) {
    user_id = req.body.userid;
    password = req.body.pw;
    user_name = req.body.username;
    student_id = req.body.studentid;
    var responseStatus;
    var encryptedpw = encrypt(password);
    var identifyUniv = user_id.split('@');
    var sql = `
    SELECT
        id
    FROM
        g_authentication
    WHERE
        id=?
    `
    var id = [user_id];
    con.query(sql, id, function (err, result) {
        if (err) {
            logger.info(`GC_IF_STCD_SD SE PROC_STEP:1 SUCC_CNT:0 FAIL_CNT:1`);
            logger.error(`GC_IF_STCD_SD SE ERROR_CODE:EAC001 LS:1`);
            res.json(err);
        }
        else {
            if (result[0] === undefined) {
                var Data = {
                    "studentid": student_id,
                    "studentname": user_name
                };
                //A대학에서 학생 찾기
                if (identifyUniv[1] == "Auniv.com") {
                    request.post({
                        headers: { 'content-type': 'application/json' },
                        url: 'http://localhost:65004/aunivdata/identify',
                        body: Data,
                        json: true
                    }, function (err, req, result_A) {
                        if (err) {
                            logger.info(`GC_IF_STCD_SD SE PROC_STEP:4 SUCC_CNT:3 FAIL_CNT:1`);
                            logger.error(`GC_IF_STCD_SD SE ERROR_CODE:ESS005 LS:4`);//ESS005 DB 연결 x
                            res.json(err);
                        } else {
                            if (req.statusCode == 201) {
                                var sql4 = "INSERT INTO g_university(student_id, student_name, department_name, student_univ) VALUES('" + result_A.student_id + "','" + result_A.student_name + "','" + result_A.department_name + "', 'A대학')"
                                con.query(sql4, function (err, result) {
                                    if (err) {
                                        logger.info(`GC_IF_STCD_SD SE PROC_STEP:6 SUCC_CNT:5 FAIL_CNT:1`);
                                        logger.error(`GC_IF_STCD_SD SE ERROR_CODE:EAL001 LS:6`);
                                    }
                                })
                                var sql2 = "INSERT INTO g_authentication(id, student_name, pw) VALUES('" + user_id + "','" + user_name + "','" + encryptedpw + "')"
                                con.query(sql2, function (err, result) {
                                    if (err) {
                                        logger.info(`GC_IF_STCD_SD SE PROC_STEP:7 SUCC_CNT:5 FAIL_CNT:1`);
                                        logger.error(`GC_IF_STCD_SD SE ERROR_CODE:EAL001 LS:7`);
                                    }
                                })
                                var sql3 = "INSERT INTO g_user(student_name, student_id, department_name) VALUES('" + result_A.student_name + "','" + result_A.student_id + "','" + result_A.department_name + "')"
                                con.query(sql3, function (err, result) {
                                    if (err) {
                                        logger.info(`GC_IF_STCD_SD SE PROC_STEP:8 SUCC_CNT:5 FAIL_CNT:1`);
                                        logger.error(`GC_IF_STCD_SD SE ERROR_CODE:EAL001 LS:8`);
                                    }
                                })
                                logger.info(`GC_IF_STCD_SD CF PROC_STEP:9 SUCC_CNT:7 FAIL_CNT:0`);
                                res.writeHead(201, { 'Content-Type': 'text/html;charset=UTF-8' });
                                res.write("<script>alert('A대학회원 가입 완료.')</script>");
                                res.write("<script>window.location=\"../\"</script>");
                            } else {
                                logger.info(`GC_IF_STCD_SD SE PROC_STEP:5 SUCC_CNT:4 FAIL_CNT:1`);
                                logger.error(`GC_IF_STCD_SD SE ERROR_CODE:EAD002 LS:5`);
                                res.writeHead(306, { 'Content-Type': 'text/html;charset=UTF-8' });
                                res.write("<script>alert('대학에서 학생 정보를 찾지 못했습니다.')</script>");
                                res.write("<script>window.location=\"../\"</script>");
                            }
                        }
                    });
                }
                //B대학에서 학생 찾기
                else if (identifyUniv[1] == "Buniv.com") {

                    request.post({
                        headers: { 'content-type': 'application/json' },
                        url: 'http://localhost:65005/bunivdata/identify',
                        body: Data,
                        json: true
                    }, function (err, req, result_A) {
                        if (err) {
                            logger.info(`GC_IF_STCD_SD SE PROC_STEP:4 SUCC_CNT:3 FAIL_CNT:1`);
                            logger.error(`GC_IF_STCD_SD SE ERROR_CODE:ESS005 LS:4`);
                            res.json(err);
                        } else {
                            if (req.statusCode == 201) {
                                var sql4 = "INSERT INTO g_university(student_id, student_name, department_name, student_univ) VALUES('" + result_A.student_id + "','" + result_A.student_name + "','" + result_A.department_name + "', 'B대학')"
                                con.query(sql4, function (err, result) {
                                    if (err) {
                                        logger.info(`GC_IF_STCD_SD SE PROC_STEP:6 SUCC_CNT:5 FAIL_CNT:1`);
                                        logger.error(`GC_IF_STCD_SD SE ERROR_CODE:EAL001 LS:6`);
                                    }
                                })
                                var sql2 = "INSERT INTO g_authentication(id, student_name, pw) VALUES('" + user_id + "','" + user_name + "','" + encryptedpw + "')"
                                con.query(sql2, function (err, result) {
                                    if (err) {
                                        logger.info(`GC_IF_STCD_SD SE PROC_STEP:7 SUCC_CNT:5 FAIL_CNT:1`);
                                        logger.error(`GC_IF_STCD_SD SE ERROR_CODE:EAL001 LS:7`);
                                    }
                                })
                                var sql3 = "INSERT INTO g_user(student_name, student_id, department_name) VALUES('" + result_A.student_name + "','" + result_A.student_id + "','" + result_A.department_name + "')"
                                con.query(sql3, function (err, result) {
                                    if (err) {
                                        logger.info(`GC_IF_STCD_SD SE PROC_STEP:8 SUCC_CNT:5 FAIL_CNT:1`);
                                        logger.error(`GC_IF_STCD_SD SE ERROR_CODE:EAL001 LS:8`);
                                    }
                                })
                                logger.info(`GC_IF_STCD_SD CF PROC_STEP:7 SUCC_CNT:7 FAIL_CNT:0`);
                                res.writeHead(201, { 'Content-Type': 'text/html;charset=UTF-8' });
                                res.write("<script>alert('B대학회원 가입 완료.')</script>");
                                res.write("<script>window.location=\"../\"</script>");
                            } else {
                                logger.info(`GC_IF_STCD_SD SE PROC_STEP:5 SUCC_CNT:4 FAIL_CNT:1`);
                                logger.error(`GC_IF_STCD_SD SE ERROR_CODE:EAD002 LS:5`);
                                res.writeHead(306, { 'Content-Type': 'text/html;charset=UTF-8' });
                                res.write("<script>alert('대학에서 학생 정보를 찾지 못했습니다.')</script>");
                                res.write("<script>window.location=\"../\"</script>");
                            }
                        }
                    });
                }
                //C대학에서 학생 찾기
                else if (identifyUniv[1] == "Cuniv.com") {

                    request.post({
                        headers: { 'content-type': 'application/json' },
                        url: 'http://localhost:65006/cunivdata/identify',
                        body: Data,
                        json: true
                    }, function (err, req, result_A) {
                        if (err) {
                            logger.info(`GC_IF_STCD_SD SE PROC_STEP:4 SUCC_CNT:3 FAIL_CNT:1`);
                            logger.error(`GC_IF_STCD_SD SE ERROR_CODE:ESS005 LS:4`);
                            res.json(err);
                        } else {
                            if (req.statusCode == 201) {
                                var sql4 = "INSERT INTO g_university(student_id, student_name, department_name, student_univ) VALUES('" + result_A.student_id + "','" + result_A.student_name + "','" + result_A.department_name + "', 'C대학')"
                                con.query(sql4, function (err, result) {
                                    if (err) {
                                        logger.info(`GC_IF_STCD_SD SE PROC_STEP:6 SUCC_CNT:5 FAIL_CNT:1`);
                                        logger.error(`GC_IF_STCD_SD SE ERROR_CODE:EAL001 LS:6`);
                                    }
                                })
                                var sql2 = "INSERT INTO g_authentication(id, student_name, pw) VALUES('" + user_id + "','" + user_name + "','" + encryptedpw + "')"
                                con.query(sql2, function (err, result) {
                                    if (err) {
                                        logger.info(`GC_IF_STCD_SD SE PROC_STEP:7 SUCC_CNT:5 FAIL_CNT:1`);
                                        logger.error(`GC_IF_STCD_SD SE ERROR_CODE:EAL001 LS:7`);
                                    }
                                })
                                var sql3 = "INSERT INTO g_user(student_name, student_id, department_name) VALUES('" + result_A.student_name + "','" + result_A.student_id + "','" + result_A.department_name + "')"
                                con.query(sql3, function (err, result) {
                                    if (err) {
                                        logger.info(`GC_IF_STCD_SD SE PROC_STEP:8 SUCC_CNT:5 FAIL_CNT:1`);
                                        logger.error(`GC_IF_STCD_SD SE ERROR_CODE:EAL001 LS:8`);
                                    }
                                })
                                logger.info(`GC_IF_STCD_SD CF PROC_STEP:7 SUCC_CNT:7 FAIL_CNT:0`);
                                res.writeHead(201, { 'Content-Type': 'text/html;charset=UTF-8' });
                                res.write("<script>alert('C대학회원 가입 완료.')</script>");
                                res.write("<script>window.location=\"../\"</script>");
                            } else {
                                logger.info(`GC_IF_STCD_SD SE PROC_STEP:5 SUCC_CNT:4 FAIL_CNT:1`);
                                logger.error(`GC_IF_STCD_SD SE ERROR_CODE:EAD002 LS:4`);
                                res.writeHead(306, { 'Content-Type': 'text/html;charset=UTF-8' });
                                res.write("<script>alert('대학에서 학생 정보를 찾지 못했습니다.')</script>");
                                res.write("<script>window.location=\"../\"</script>");
                            }
                        }
                    });
                }
                else {
                    logger.info(`GC_IF_STCD_SD SE PROC_STEP:3 SUCC_CNT:2 FAIL_CNT:1`);
                    logger.error(`GC_IF_STCD_SD SE ERROR_CODE:EAD002 LS:3`);
                    res.writeHead(307, { 'Content-Type': 'text/html;charset=UTF-8' });
                    res.write("<script>alert('A,B,C 대학 학생이 아닙니다.')</script>");
                    res.write("<script>window.location=\"../\"</script>");
                };
            }
            else {
                logger.info(`GC_IF_STCD_SD CE PROC_STEP:2 SUCC_CNT:1 FAIL_CNT:1`);
                logger.error(`GC_IF_STCD_SD SE ERROR_CODE:EAD001 LS:2`);
                res.writeHead(307, { 'Content-Type': 'text/html;charset=UTF-8' });
                res.write("<script>alert('다른 ID를 사용해주세요.')</script>");
                res.write("<script>window.location=\"../\"</script>");
            }
        }
    });
});

//로그인 GET
router.get('/', function (req, res, next) {
    let session = req.session;
    if (session.email) {
        var sql = 'select * from g_schedule where student_id=?;'
        con.query(sql, session.permission, function (err, result) {
            if (err) {
                logger.info(`GC_IF_STCD_SD SE PROC_STEP:1 SUCC_CNT:0 FAIL_CNT:1`);
                logger.error(`GC_IF_STCD_SD SE ERROR_CODE:ESS005 LS:1`);
                res.send(err);
            }
            var sql2 = 'select * from g_university where student_id=?;'
            con.query(sql2, session.permission, function (err, result_2) {
                if (err) {
                    logger.info(`GC_IF_STCD_SD SE PROC_STEP:2 SUCC_CNT:1 FAIL_CNT:1`);
                    logger.error(`GC_IF_STCD_SD SE ERROR_CODE:ESS005 LS:2`);
                    res.send(err);
                }
                res.render("pages/main", {
                    session: session, "list": result, "user": result_2
                });
            });
        });
    } else {
        res.render("pages/main", {
            session: session
        });
    }
})

//로그인 POST
router.post('/signin', function (req, res, next) {
    user_id = req.body.userid;
    password = req.body.pw;
    var identifyUniv = user_id.split('@');
    var sql = `
    SELECT
        id, student_name, pw, private_number
    FROM
        g_authentication
    WHERE
        id=?
    `
    var id = [user_id];
    con.query(sql, id, function (err, result) {
        if (err) {
            logger.info(`GC_IF_STCD_SD SE PROC_STEP:1 SUCC_CNT:0 FAIL_CNT:1`);
            logger.error(`GC_IF_STCD_SD SE ERROR_CODE:EAC001 LS:1`);
            res.status(202).json({ messeage: "id not found" });
        }
        else {
            var decryptedpw = decrypt(result[0].pw);
            if (password === decryptedpw) {
                var sql2 = `
                    SELECT
                        student_id
                    FROM
                        g_user
                    WHERE
                        private_number=?
                    `
                con.query(sql2, result[0].private_number, function (err, result) {
                    req.session.email = user_id; // 세션 생성
                    req.session.permission = result[0].student_id;

                    if (identifyUniv[1] == "Auniv.com") {
                        res.redirect("/");
                    } else if (identifyUniv[1] == "Buniv.com") {
                        res.redirect("/");
                    } else if (identifyUniv[1] == "Cuniv.com") {
                        res.redirect("/");
                    } else {
                        res.writeHead(308, { 'Content-Type': 'text/html;charset=UTF-8' });
                        res.write("<script>alert('올바르지 않은 이메일입니다.')</script>");
                        res.write("<script>window.location=\"../\"</script>");
                    }
                });
            }
            else {
                logger.info(`GC_IF_STCD_SD SE PROC_STEP:2 SUCC_CNT:1 FAIL_CNT:1`);
                logger.error(`GC_IF_STCD_SD SE ERROR_CODE:EAC001 LS:2`);
                res.writeHead(308, { 'Content-Type': 'text/html;charset=UTF-8' });
                res.write("<script>alert('비밀번호가 다릅니다 다시 입력해주세요')</script>");
                res.write("<script>window.location=\"../\"</script>");
            }
        }
    })
});

//로그아웃
router.get("/logout", function (req, res, next) {
    req.session.destroy();
    res.clearCookie('sid');
    res.redirect("/");
})

//암호변경 GET
router.get('/pw_change', function (req, res, next) {
    let session = req.session;
    res.render("pages/changepw", {
        session: session
    });
})

//암호변경 POST
router.post('/pw_change', function (req, res, next) {
    id = req.body.id;
    password = req.body.current_pw;
    changed_pw = req.body.pw;
    var sql = `
        SELECT
            pw
        FROM
            g_authentication
        WHERE
            id=?
    `
    var verifyid = [id];
    con.query(sql, verifyid, function (err, result) {
        if (err) {
            logger.info(`GC_IF_STCD_SD SE PROC_STEP:1 SUCC_CNT:10FAIL_CNT:1`);
            logger.error(`GC_IF_STCD_SD SE ERROR_CODE:EAD002 LS:1`);
            console.log(err)
        }
        else {
            var decrypted_pw = decrypt(result[0].pw)
            if (password == decrypted_pw) {
                var sql_changepw = `
                        UPDATE
                            g_authentication
                        SET
                            pw = ?
                        WHERE
                            id = ?
                    `
                var encrypted_changed_pw = encrypt(changed_pw);
                con.query(sql_changepw, [encrypted_changed_pw, id], function (err, result) {
                    if (err) {
                        logger.info(`GC_IF_STCD_SD SE PROC_STEP:3 SUCC_CNT:2 FAIL_CNT:1`);
                        logger.error(`GC_IF_STCD_SD SE ERROR_CODE:ESS005 LS:3`);
                        res.json(err);
                    }
                    else {
                        logger.info(`GC_IF_STCD_SD SF PROC_STEP:4 SUCC_CNT:4 FAIL_CNT:0`);
                        // res.status(201).json({ messeage: "암호 변경 완료" });
                        res.writeHead(308, { 'Content-Type': 'text/html;charset=UTF-8' });
                        res.write("<script>alert('암호가 변경되었습니다.')</script>");
                        res.write("<script>window.location=\"../\"</script>");
                    }
                });
            }
            else {
                logger.info(`GC_IF_STCD_SD SE PROC_STEP:2 SUCC_CNT:1 FAIL_CNT:1`);
                logger.error(`GC_IF_STCD_SD SE ERROR_CODE:EAC001 LS:2`);
                res.writeHead(308, { 'Content-Type': 'text/html;charset=UTF-8' });
                res.write("<script>alert('비밀번호가 다릅니다 다시 입력해주세요')</script>");
            }
        }
    });
});

//에러로그 출력
router.get('/errorlog/:id', async function (req, res, next) {
    let session = req.session;
    var jsonArr = await readErrorLog(req.params.id);
    var filename = await ErrorfileName(req.params.id);
    var fileList = await ErrorfileList();
    res.render('pages/errorlog', { 'list': jsonArr, session: session, "filename": filename.split('.')[0], "fileList": fileList });
})

//로그 출력
router.get('/logsearch/:id', async function (req, res, next) {
    let session = req.session;
    var jsonArr = await readLog(req.params.id);
    var filename = await LogfileName(req.params.id);
    var fileList = await LogfileList();
    res.render('pages/logsearch', { 'list': jsonArr, session: session, "filename": filename.split('.')[0], "fileList": fileList });
})

//대학 데이터 연동 페이지
router.get('/univdata', function (req, res, next) {
    let session = req.session;
    res.render("pages/univdata", {
        session: session
    });
})

//A대학 연동 버튼
router.get('/aunivbutton', function (req, res, next) {
    var stid = req.session.permission;
    var Data = {
        "student_id": stid
    };
    request.post({
        headers: { 'content-type': 'application/json' },
        url: 'http://localhost:65004/aunivdata/send',
        body: Data,
        json: true
    }, async function (err, req) {
        logger.info(`GC_IF_STCD_SD SF PROC_STEP:3 SUCC_CNT:3 FAIL_CNT:0`);
        console.log(await scheduleValidation('A', req.body));
        res.redirect('/');
    });
})

//B대학 연동 버튼
router.get('/bunivbutton', function (req, res, next) {
    var stid = req.session.permission;
    var Data = {
        "student_id": stid
    };
    request.post({
        headers: { 'content-type': 'application/json' },
        url: 'http://localhost:65005/bunivdata/send',
        body: Data,
        json: true
    }, async function (err, req) {
        logger.info(`GC_IF_STCD_SD SF PROC_STEP:3 SUCC_CNT:3 FAIL_CNT:0`);
        console.log(await scheduleValidation('B', req.body));
        res.redirect('/');
    });
})

//C대학 연동 버튼
router.get('/cunivbutton', function (req, res, next) {
    var stid = req.session.permission;
    var Data = {
        "student_id": stid
    };
    request.post({
        headers: { 'content-type': 'application/json' },
        url: 'http://localhost:65006/cunivdata/send',
        body: Data,
        json: true
    }, async function (err, req) {
        logger.info(`GC_IF_STCD_SD SF PROC_STEP:3 SUCC_CNT:3 FAIL_CNT:0`);
        console.log(await scheduleValidation('C', req.body));
        res.redirect('/');
    });
})


module.exports = router;
