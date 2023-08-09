#!/usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const transform = require('./lib/index')

program
	.option('-s, --src <path>', '源文件路径，可以为目录或文件路径，默认执行目录')
	.option('-o, --out <path>', '输出文件目录，默认执行目录下的 temp_out')
	.option('-e, --empty', '是否清空目标目录')
	.option(
		'-q, --quiet',
		'是否只输出转换失败的记录，默认 false，展示所有转换的记录'
	)
	.option(
		'-i, --ignore <ignoredir>',
		'忽略文件夹列表，默认为空',
		(value) => {
			return value.split(/\s+/)
		}
	)
	.option(
		'-f, --format',
		"是否格式化"
	)
	.action((options) => {
		transform(options)
			.then(() => {
				console.log()
				process.exit(1)
			})
			.catch((err) => {
				console.log(chalk.red(err))
				process.exit(1)
			})
	})

program
	.version(require('./package').version)
	.description(chalk.green('jsn to hola 代码转换插件'))

program.exitOverride();
try {
  program.parse(process.argv);
} catch (err) {
	err.code === 'commander.unknownOption' && console.log(chalk.yellow('(add --help for additional information)'))
}
