const fse = require('fs-extra')
const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const cliProgress = require('cli-progress');

const check = require('../utils/check')
const {logToFile, clearLogFile, logFilePath} = require('../utils/log')
const transform = require('./transform')


let timer = null
let index = 0
const frames = ['.', '..', '...']

function clearTimer() {
	if (timer) {
		clearInterval(timer)
		timer = null
		index = 0
		process.stdout.clearLine()
	}
}

// 单文件内容转换
function handleFileTransform(filePath, options) {
	const { quiet } = options
	const source = fse.readFileSync(filePath).toString();
	let isError = false;
	//空文件处理
	try {
		if (source.trim() === '') {
			fse.writeFileSync(filePath, source);
		} else {
			isError = transform({ source, filePath }, options)
		}
		!quiet && !isError && logToFile(`success: ${filePath}  === 转换成功`)
		isError && logToFile(`failed: ${filePath} === 转换失败`)
	} catch (err) {
		logToFile(`failed: ${filePath} === 转换失败`)
	}
}


// 拷贝源目录文件到目标文件
function copySrcToOut(src, out, options) {
	const { ignore = [], isSingle } = options
	const filePaths = []
	function traverseDirectory(currentDirPath, isIgnore) {
		const files = fs.readdirSync(currentDirPath)
		files.forEach((file) => {
			if (file === 'node_modules') return
			const isIgnoreFile = ignore.includes(file)
			const filePath = path.join(currentDirPath, file)
			const stat = fs.statSync(filePath)

			if (stat.isFile()) {
				const extname = path.extname(filePath)
				const targetFilePath = filePath.replace(src, out)
				!isIgnore && !isIgnoreFile && extname === '.vue' && filePaths.push(targetFilePath)
				fse.copySync(filePath, targetFilePath)
			} else if (stat.isDirectory()) {
				traverseDirectory(filePath, isIgnoreFile)
			}
		})
	}
	if (isSingle) {
		filePaths.push(out)
		fse.copySync(src, out)
	} else {
		traverseDirectory(src, false)
	}
	return filePaths
}
// 工程转换处理
function handleCommand(options, resolve, reject) {
	let { srcPath, outPath, isSingle } = options
	let filePaths = []
	console.log(`执行转换源路径：${srcPath}\n`)
	console.log(`执行转换目标路径：${outPath}\n`)

	try {
		// 拷贝工程
		timer = setInterval(() => {
			index = index === frames.length - 1 ? 0 : ++index
			process.stdout.write(`\r\n${chalk.green('文件拷贝中' + frames[index])}\n`)
		}, 100)
		if (srcPath !== outPath) {
			const srcBasename = path.basename(srcPath)
			// 清空目标目录
			options.empty && fse.emptyDirSync(outPath)
			if (isSingle) {
				outPath = path.join(outPath, srcBasename)
			}
			filePaths = copySrcToOut(srcPath, outPath, options) || []
		}
	} catch (err) {
		console.log(err)
		return reject('源路径文件拷贝到目标路径失败')
	}
	clearTimer()
	clearLogFile();
	try {
		const bar1 = new cliProgress.SingleBar({
			format: '转换中 [{bar}] {percentage}% | {value}/{total} | {duration}s'
		}, cliProgress.Presets.rect);
		if (filePaths.length) {
			bar1.start(filePaths.length, 0);
			bar1.updateETA();
		}
		filePaths.forEach((filePath, index) => {
			try {
				handleFileTransform(filePath, { ...options })
			} catch (err) {
				logToFile(`failed: ${filePath} === 转换失败`)
			}
			bar1.update(index + 1);
		})
		bar1.stop();
		logToFile(`执行转化文件数量: ${filePaths.length}`, true)
		console.log('转换日志:', chalk.blue(logFilePath))
		resolve()
	} catch (err) {
		return reject('文件路径获取失败')
	}
}

module.exports = (options) => {
	return new Promise((resolve, reject) => {
		check
			.checkOptions(options)
			.then((res) => {
				handleCommand(res, resolve, reject)
			})
			.catch((err) => {
				reject(err)
			})
	})
}
