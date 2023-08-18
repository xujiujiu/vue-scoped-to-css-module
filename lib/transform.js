const $ = require('gogocode')
const fse = require('fs-extra')
const prettier = require('prettier')
const styleTransform = require('../transform/style');
/**
 * 转换入口导出一个函数，按照如下函数签名
 * @param {*} fileInfo 包含 source 和 path 属性
 * @param {*} options 其他 option 由此传入
 * @returns {string} 返回转换后的代码
 */
module.exports = async (fileInfo, options) => {
  let isError = false
  const { source, filePath } = fileInfo
	const { format } = options
  const ast = $(source, { parseOptions: { language: 'vue' } })
  try {
    // 检测 template、script
    const template = ast.find('<template></template>')
    const script = ast.find('<script></script>')
    if (!script.length) {
      logToFile(`vue file transform to ast failed，filepath: ${filePath}`)
      isError = true
    }
  } catch (err) {
    logToFile(`vue file transform to ast failed，filepath: ${filePath}`)
    isError = true
  }
  let outAST = source
    // console.log('source1' + ruleCfg.name, ast)
    try {
      if (!isError) outAST = await styleTransform(source, $, { ...options, filePath });
    } catch (error) {
      debugger
      console.log(error)
      isError = true
    }

	// 格式化转换
	const outPut = format ? prettier.format(outAST, {
		trailingComma: 'es5',
		tabWidth: 2,
		semi: false,
		singleQuote: true,
		printWidth: 80,
		parser: 'vue',
	}) : outAST;
  
  fse.writeFileSync(filePath, outPut)
  return isError

}