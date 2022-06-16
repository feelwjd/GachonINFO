var fs = require('fs');
const path = require('path');
const log_dirname = path.join(__dirname + '/../logs/info/');
const err_dirname = path.join(__dirname + '/../logs/error/');
const FILE_NUM = fs.readdirSync(log_dirname).length;

function readErrorLog(i) {
    return new Promise((resolve) => {
        var files = fs.readdirSync(err_dirname); // 디렉토리를 읽어온다
        console.log(files);
        var file = files[i];
        var suffix = file.substr(file.length - 4, file.length); // 확장자 추출
        // 확장자가 json일 경우 읽어 내용 출력
        if (suffix === '.log') {
            fs.readFile(err_dirname + '/' + file, 'utf8', function (err, data) {
                if (err) { res.status(404); }
                var jsonArr = [];
                var log_line = data.split('\n');
                console.log(log_line.length);
                console.log(log_line[0]);
                for (var i = 0; i < log_line.length; i++) {
                    var jsonObj = {};
                    var logs = log_line[i].split(' ');
                    jsonObj.time = logs[0];
                    jsonObj.status = logs[1];
                    jsonObj.interface = logs[2];
                    jsonObj.process_code = logs[3];
                    jsonObj.error_code = logs[4];
                    jsonObj.locate = logs[5];
                    jsonArr.push(jsonObj);
                }
                resolve(jsonArr);
            });
        } else { res.status(500); }
    })
}

function readLog(i) {
    return new Promise((resolve) => {
        var files = fs.readdirSync(log_dirname); // 디렉토리를 읽어온다
        console.log(files);
        var file = files[i];
        var suffix = file.substr(file.length - 4, file.length); // 확장자 추출
        // 확장자가 json일 경우 읽어 내용 출력
        if (suffix === '.log') {
            fs.readFile(log_dirname + '/' + file, 'utf8', function (err, data) {
                if (err) { res.status(404); }
                var jsonArr = [];
                var log_line = data.split('\n');
                console.log(log_line.length);
                console.log(log_line[0]);
                for (var i = 0; i < log_line.length; i++) {
                    var jsonObj = {};
                    var logs = log_line[i].split(' ');
                    jsonObj.time = logs[0];
                    jsonObj.status = logs[1];
                    jsonObj.interface = logs[2];
                    jsonObj.process_code = logs[3];
                    jsonObj.process_all = logs[4];
                    jsonObj.process_success = logs[5];
                    jsonObj.process_fail = logs[6];
                    jsonArr.push(jsonObj);
                }
                resolve(jsonArr);
            });
        } else { res.status(500); }
    })
}

function LogfileName(i) {
    return new Promise((resolve) => {
        var files = fs.readdirSync(log_dirname); // 디렉토리를 읽어온다
        var file = files[i];
        resolve(file);
    })
}

function ErrorfileName(i) {
    return new Promise((resolve) => {
        var files = fs.readdirSync(err_dirname); // 디렉토리를 읽어온다
        var file = files[i];
        resolve(file);
    })
}

function ErrorfileList() {
    return new Promise((resolve) => {
        var files = fs.readdirSync(err_dirname); // 디렉토리를 읽어온다
        resolve(files);
    })
}

function LogfileList() {
    return new Promise((resolve) => {
        var files = fs.readdirSync(log_dirname); // 디렉토리를 읽어온다
        resolve(files);
    })
}

module.exports = {
    ErrorfileList, LogfileList, ErrorfileName, LogfileName, readLog, readErrorLog, FILE_NUM, log_dirname, err_dirname
};