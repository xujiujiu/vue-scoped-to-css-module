const fs = require('fs');
const path = require('path');
const PWD_PATH = process.cwd()
const fse = require('fs-extra')

// 日志文件路径
const logFilePath = path.join(PWD_PATH, 'scoped2module.log');

function getChinaTime() {
  const now = new Date();
  const chinaTimeOffset = 8 * 60; // 中国时区 UTC+8
  now.setMinutes(now.getMinutes() + chinaTimeOffset);
  return now.toISOString().replace('T', ' ').slice(0, -1); // 去掉最后的 'Z'
}

// 自定义日志函数，将日志写入文件
module.exports = {
  logFilePath,
  logToFile(message, showLog) {
    showLog && console.log(`${message}`)
    const logMessage = `[${getChinaTime()}] ${message}\n`;
    try {
      fs.appendFileSync(logFilePath, logMessage)
    } catch (err) {
      console.error('Error writing to log file:', err);
    }
  },
  clearLogFile() {
    if (fse.existsSync(logFilePath)) {
      fse.removeSync(logFilePath);
    }
  }
}