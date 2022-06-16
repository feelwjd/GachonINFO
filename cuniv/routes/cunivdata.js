var express = require('express');
const app = require('../app');
var router = express.Router();
const mysql = require('mysql');
const e = require('express');
const multer = require("multer");
const path = require("path");
router.use(express.json());
var logger = require('../config/winston');
var { mapDepartment, mapSubject } = require('./mapping');
const dotenv = require('dotenv');
dotenv.config();

const con = mysql.createConnection({
    host: 'localhost',
    user: '2022ipp',
    password: process.env.DB_PW,
    database: '2_IPP',
    multipleStatements: true,
});

con.connect();
router.get('/send', (req, res) => {
    res.send('되긴 함?')
    console.log('hello');
})

//cuniv 데이터 전송
router.post('/send', function (req, res, next) {
    stu_id = req.body.student_id;
    var sql = `
        SELECT 
            * 
        FROM 
            c_class 
        
    `

    con.query(sql, async (err, result) => {
        if (err) {
            logger.info(`C_LNK_SDSE PROC_STEP:1 SUCC_CNT:0 FAIL_CNT:1`);
            logger.error(`C_LNK_SD SE ERROR_CODE:EAC001`);
            console.log(err);
        }
        else {
            if (result[0] === undefined) {
                logger.info(`C_LNK_SD SE PROC_STEP:2 SUCC_CNT:1 FAIL_CNT:1`);
                res.status(401).json({ messeage: "not exist" });
            }
            else {
                var jsonArr = [];
                for (var i = 0; i < result.length; i++) {
                    var jsonObj = {};
                    jsonObj.class_number = result[i].class_number;
                    jsonObj.student_id = result[i].student_id;
                    jsonObj.subject_name = await mapSubject(result[i].subject_code);
                    jsonObj.class_day = result[i].class_day;
                    jsonObj.class_time = String(result[i].class_time);
                    jsonObj.grade = '미처리';
                    jsonObj.classroom = result[i].classroom;
                    jsonObj.class_professor = result[i].class_professor;
                    jsonObj.univ = 'C';
                    jsonArr.push(jsonObj);
                }
                logger.info(`C_LNK_SD SE PROC_STEP:2 SUCC_CNT:2 FAIL_CNT:0`);
                console.log(jsonArr);
                res.status(201).send(jsonArr);
            }
        }
    })
});

router.post('/identify', function (req, res, next) {
    student_name = req.body.studentname;
    student_id = req.body.studentid;
    var sql_identifyUniv = `
                    SELECT
                        student_name, student_id, department_code
                    FROM
                        c_student
                    WHERE
                        student_name=?
                    AND
                        student_id=?
                    `
    var name = [student_name, student_id];
    con.query(sql_identifyUniv, name, async (err, result) => {
        let department_name = await mapDepartment(result[0].department_code);
        console.log(department_name);
        if (err) {
            logger.info(`C_LNK_SD SE PROC_STEP:1 SUCC_CNT:0 FAIL_CNT:1`);
            logger.error(`C_LNK_SD SE ERROR_CODE:EAC001`);
            res.json(err)
        }
        else {
            if (result[0] === undefined) {
                logger.info(`C_LNK_SD SE PROC_STEP:2 SUCC_CNT:1 FAIL_CNT:1`);
                res.status(401).json({ messeage: "not exist" });
            }
            else {
                var jsonObj = {};
                jsonObj.student_name = result[0].student_name;
                jsonObj.student_id = result[0].student_id;
                jsonObj.department_name = department_name;
                logger.info(`C_LNK_SD SE PROC_STEP:2 SUCC_CNT:2 FAIL_CNT:0`);
                console.log(jsonObj);
                res.status(201).send(jsonObj);
            }
        }
    })
});


module.exports = router;