const fse = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

module.exports = {
  checkOptions({ src, out, quiet, ignore, empty }) {
    const transformParams = {}
    return new Promise((resolve, reject) => {
      let srcPath = path.resolve(src || '')
      let outPath = path.resolve(out || 'temp_out')
      const srcCheckResult = this.checkSrcPath(srcPath, reject)
      const isSingle = srcCheckResult.type === 'file'
      if (!srcCheckResult.result) return
      
			if (!src) {
				console.log(
					chalk.yellow('warn: --src or -s not input , use root path instead')
				)
      }
			if (!out && srcPath) {
				console.log(
					chalk.yellow('warn: --out or -o not input , use temp_out path instead')
				)
      }
			resolve({
				srcPath,
        outPath,
        isSingle,
        ignore: (ignore || []).concat(['node_modules']),
        quiet: !!quiet,
        empty: !!empty
			})
		})
  },
  checkSrcPath(src, reject) {
    if (!src) {
      reject('未输入源文件路径')
      return {
        result: false
      }
    }
    try {
      const d = fse.statSync(src)
      if (d.isFile()) {
        if (path.extname(src) !== '.vue') {
          reject('只支持转换 vue 文件')
          return {
            result: false
          }
        } else {
          return {
            type: 'file',
            result: true
          }
        }
      } else if (d.isDirectory()) {
        return {
          type: 'directory',
          result: true
        }
      } else {
        return {
          result: false
        }
      }
    } catch (err) {
      reject('源文件路径不存在')
      return {
        result: false
      }
    }
  }
}
