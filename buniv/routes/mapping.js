var express = require('express');
const app = require('../app');
var router = express.Router();
const mysql = require('mysql');
const multer = require("multer");
const path = require("path");
var logger = require('../config/winston');
const dotenv = require('dotenv');
const { resolve } = require('path');
dotenv.config();

const con = mysql.createConnection({
    host: 'localhost',
    user: '2022ipp',
    password: process.env.DB_PW,
    database: '2_IPP',
    multipleStatements: true,
});

function mapSubject(code) {
    return new Promise((resolve) => {
        var sql = `
            SELECT
                subject_name
            FROM
                b_subject
            WHERE
                subject_code=?
            `
        con.query(sql, code, function (err, result) {
            if (err) {
                logger.info(`B_IF_STCD_SD SE PROC_STEP:1 SUCC_CNT:0 FAIL_CNT:1`); // 수정
                logger.error(`B_IF_STCD_SD SE ERROR_CODE:EAC001`);
                res.json(err);
            } else {
                // console.log(code);
                let subject_name = result[0].subject_name;
                //console.log(result[0].department_name);
                resolve(subject_name);
            }
        });
    })
}

module.exports = {
    mapSubject
}