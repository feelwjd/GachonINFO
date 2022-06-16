var express = require('express');
const app = require('../app');
var router = express.Router();
const mysql = require('mysql');
const { CONNREFUSED } = require('dns');
var logger = require('../config/winston');
router.use(express.json());

const con = mysql.createConnection({
    host: 'localhost',
    user: '2022ipp',
    password: process.env.DB_PW,
    database: '2_IPP',
    multipleStatements: true,
});

con.connect();

function scheduleValidation(univ, schedule) {
    return new Promise((resolve) => {
        var sql = 'select * from g_schedule where univ=?;';
        con.query(sql, univ, function (err, result) {
            if (err) {
                logger.info(`GC_IF_STCD_SD SE PROC_STEP:1 SUCC_CNT:0 FAIL_CNT:1`);
                logger.error(`GC_IF_STCD_SD SE ERROR_CODE:ESS005 LS:1`); //ESS005 DB 연결 x
                return err;
            } else {
                if (result[0] == undefined) {
                    for (var i = 0; i < schedule.length; i++) {
                        var sql2 = 'insert into g_schedule values (?, ?, ?, ?, ?, ?, ?, ?, ?);';
                        var data = [schedule[i].class_number, schedule[i].student_id, schedule[i].subject_name, schedule[i].class_day, schedule[i].class_time, schedule[i].grade, schedule[i].classroom, schedule[i].class_professor, schedule[i].univ];
                        con.query(sql2, data, function (err) {
                            if (err) {
                                logger.info(`GC_IF_STCD_SD SE PROC_STEP:2 SUCC_CNT:1 FAIL_CNT:1`);
                                logger.error(`GC_IF_STCD_SD SE ERROR_CODE:ESS005 LS:2`); //ESS005 DB 연결 x
                                return err;
                            }
                            resolve('INSERT NEW DATA');
                        });
                    }
                } else {
                    if (JSON.stringify(result) === JSON.stringify(schedule)) {
                        resolve('NOT CHANGE');
                    } else {
                        var sql1 = 'delete from g_schedule where univ=?';
                        con.query(sql1, univ, function (err) {
                            if (err) {
                                logger.info(`GC_IF_STCD_SD SE PROC_STEP:2 SUCC_CNT:1 FAIL_CNT:1`);
                                logger.error(`GC_IF_STCD_SD SE ERROR_CODE:ESS005 LS:3`); //ESS005 DB 연결 x
                                return err;
                            }
                        });
                        for (var i = 0; i < schedule.length; i++) {
                            var sql2 = 'insert into g_schedule values (?, ?, ?, ?, ?, ?, ?, ?, ?);';
                            var data = [schedule[i].class_number, schedule[i].student_id, schedule[i].subject_name, schedule[i].class_day, schedule[i].class_time, schedule[i].grade, schedule[i].classroom, schedule[i].class_professor, schedule[i].univ];
                            con.query(sql2, data, function (err) {
                                if (err) {
                                    logger.info(`GC_IF_STCD_SD SE PROC_STEP:3 SUCC_CNT:2 FAIL_CNT:1`);
                                    logger.error(`GC_IF_STCD_SD SE ERROR_CODE:ESS005 LS:4`); //ESS005 DB 연결 x
                                    return err;
                                }
                                resolve('UPDATE NEW DATA');
                            });
                        }
                    }
                }
            }
        });
    })
}

module.exports = {
    scheduleValidation
}